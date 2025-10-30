import { NextRequest, NextResponse } from 'next/server';
import { getCopyStream } from '../db';
import { isRateLimited } from '../rate-limiter';
import {
  ENTITY_COLUMNS,
  getEntityQuery,
  isSupportedEntity,
  type SupportedEntity,
} from '../queries';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    entity: string;
  }>;
}

/**
 * Extract IP address from NextRequest
 * Checks common headers set by proxies/load balancers
 */
function getClientIP(request: NextRequest): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default (should not happen in production)
  return 'unknown';
}

/**
 * GET /api/export/[entity]?filter=<filter_value>&address=<address>&height=<height>&gateway=<id>&service=<id>&app=<address>&owner=<address>&owners=<addresses>&delegators=<addresses>
 * Export entity data as CSV using PostgreSQL COPY TO STDOUT with streaming
 * Uses pg-copy-streams to stream data directly to the client as it's generated
 *
 * Query parameters:
 * - filter: Optional filter value (e.g., 'staked', 'unstaking', 'unstaked', 'low_balance', 'low_stake', 'below_min_stake')
 * - address: Optional address filter for transfers, migration, and txs entities (Shannon or Morse addresses)
 * - height: Optional block height filter for txs entity
 * - gateway: Optional gateway ID filter for apps entity
 * - service: Optional service ID filter for apps, gateways, and suppliers entities
 * - app: Optional app address filter for gateways entity
 * - owner: Optional owner address filter for suppliers entity (single address, deprecated - use owners)
 * - owners: Optional owner addresses filter for suppliers entity (comma-separated)
 * - delegators: Optional delegator addresses filter for suppliers entity (comma-separated)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { entity } = await params;

    // Validate entity
    if (!isSupportedEntity(entity)) {
      return NextResponse.json(
        {
          error: 'Invalid entity',
          message: `Entity "${entity}" is not supported. Supported entities: accounts, apps, blocks, gateways, migration, services, suppliers, transfers, txs, validators`,
        },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit per IP + entity
    if (isRateLimited(clientIP, entity)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait before trying again. Limit: 3 requests per minute per entity.',
        },
        { status: 429 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || undefined;
    const address = searchParams.get('address') || undefined;
    const height = searchParams.get('height') || undefined;

    // Entity-specific filters
    const gateway = searchParams.get('gateway') || undefined;
    const service = searchParams.get('service') || undefined;
    const app = searchParams.get('app') || undefined;
    const owner = searchParams.get('owner') || undefined;

    // Parse comma-separated arrays
    const ownersParam = searchParams.get('owners');
    const owners = ownersParam ? ownersParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    const delegatorsParam = searchParams.get('delegators');
    const delegators = delegatorsParam ? delegatorsParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    // Get COPY TO STDOUT query
    const copyQuery = getEntityQuery(entity as SupportedEntity, {
      filter,
      address,
      height,
      gateway,
      service,
      app,
      owner,
      owners,
      delegators
    });

    // Get streaming COPY query
    const { stream, client } = await getCopyStream(copyQuery);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${entity}-export-${timestamp}.csv`;

    // Get column headers from ENTITY_COLUMNS
    const headers = ENTITY_COLUMNS[entity as SupportedEntity];
    const headerRow = headers.join(',') + '\n';

    const readableStream = new ReadableStream({
      start(controller) {
        // Send header row first
        controller.enqueue(new TextEncoder().encode(headerRow));

        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(chunk);
        });

        stream.on('end', () => {
          controller.close();
          client.release();
        });

        stream.on('error', (error) => {
          console.error('Stream error:', error);
          controller.error(error);
          client.release();
        });
      },
      cancel() {
        stream.destroy();
        client.release();
      },
    });

    // Return streaming CSV response
    return new NextResponse(readableStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred during export',
      },
      { status: 500 }
    );
  }
}
