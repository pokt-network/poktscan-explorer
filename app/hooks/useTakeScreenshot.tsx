'use client'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import clsx from 'clsx'
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client'
import { useDateContext } from '@/app/dates/Context'
import { getCurrentDatetime } from '@/app/utils/format'

interface FooterProps {
  network?: string
}

function Footer({network}: FooterProps){
  const commonClasses = 'font-light text-[color:--secondary] text-[12px] tracking-wider'
  return (
    <div
      className={'w-full h-10 flex flex-row items-center justify-end pr-5 gap-[5px] bg-[color:--background]'}
    >
      {network && (
        <div
          className={'h-5 items-center justify-center border border-[color:--divider] px-[10px] mr-[10px]'}
        >
          <div className={
            clsx(
              commonClasses,
              'text-[10px]'
            )
          }>
            {network}
          </div>
        </div>
      )}
      <div className={commonClasses}>
        by
      </div>
      <div className={clsx(commonClasses, 'font-medium')}>
        poktscan.pocket.network
      </div>
    </div>
  )
}

const cloneCanvas = (oldCanvas: HTMLCanvasElement) => {
  const newCanvas = document.createElement('canvas')
  const context = newCanvas.getContext('2d')

  newCanvas.width = oldCanvas.width
  newCanvas.height = oldCanvas.height

  if (context) {
    context?.canvas.setAttribute(
      'style',
      `min-height: 100%; 
             max-height: 100%;
             min-width: 100%; 
             max-width: 100%;
             display: block; 
             box-sizing: border-box;
             ${oldCanvas.style.position ? `position: ${oldCanvas.style.position};` : ''}
             ${oldCanvas.style.zIndex ? `z-index: ${oldCanvas.style.zIndex};` : ''}
             `
    )
    context?.drawImage(oldCanvas, 0, 0)
  }
  return newCanvas
}

/* Wrapper element allows the image to be rendered in the DOM, and also prevents the
content to be visible outside the main container limits. */
const createWrapperElement = (width: number, height: number) => {
  const wrapperElement = document.createElement('div')
  wrapperElement.setAttribute('id', 'screenshotWrapperElement')
  wrapperElement.setAttribute(
    'style',
    `z-index: -2;
             position: absolute;
             top: 0;
             left: 0;
             overflow: hidden;
             min-width: ${width}px;
             min-height: ${height}px;
             max-width: ${width}px;
             max-height: ${height}px;
             width: ${width}px;
             height: ${height}px;
             `
  )
  return wrapperElement
}

function createImageElement(node: HTMLDivElement) {
  const element = document.createElement('div')
  element.setAttribute('id', 'screenshotHiddenBox')
  element.setAttribute(
    'style',
    `z-index: -2;
             min-width: ${node.clientWidth}px;
             max-width: ${node.clientWidth}px;
             width: ${node.clientWidth}px;
             height: ${node.clientHeight}px
             `
  )
  for (const child of Array.from(node.children)) {
    element.appendChild(child.cloneNode(true))
  }
  return element
}

function downloadImage(image: string, fileKeyName: string, timeZoneIsUtc: boolean) {
  if (!image) return
  const link = document.createElement('a')
  link.href = image
  link.download = `${fileKeyName}_${getCurrentDatetime(timeZoneIsUtc)}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

interface HookProps {
  nodeId: string
  fileKeyName: string
}

export default function useTakeScreenshot(hookProps: HookProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {dateTimeZone} = useDateContext()

  return {
    isLoading,
    takeScreenshot: async () => {
      try {
        setIsLoading(true)
        const {
          nodeId,
          fileKeyName,
          // actionsContainerId
        } = hookProps
        const node = document.getElementById(nodeId) as HTMLDivElement

        if (!node) {
          throw new Error('Node not found')
        }

        const refCanvas = node.getElementsByTagName('canvas')
        const imageElement = createImageElement(node)

        if (refCanvas.length) {
          for (let i = 0; i < refCanvas.length; i++) {
            const newCanvas = cloneCanvas(refCanvas[i])
            const oldCanvas = imageElement.getElementsByTagName('canvas')
            oldCanvas[i].replaceWith(newCanvas)
          }
        }

        const contentElement = document.getElementById('content-container')

        if (!contentElement) {
          throw new Error('Content element not found')
        }

        const wrapperElement = createWrapperElement(
          contentElement.clientWidth,
          contentElement.clientHeight
        )

        createRoot(wrapperElement).render(ReactDOM.createPortal(<Footer />, imageElement))

        wrapperElement.appendChild(imageElement)
        contentElement.appendChild(wrapperElement)

        const bg = window.getComputedStyle(document.body).getPropertyValue('--main-background')

        overrideStyles(imageElement)

        const image = await html2canvas(imageElement, {
          backgroundColor: bg,
          useCORS: true,
        }).then(canvas => canvas.toDataURL('image/png'))

        downloadImage(image, fileKeyName, dateTimeZone === 'utc')
        wrapperElement.remove()
        setIsLoading(false)
      } catch {
        setIsLoading(false)
      }
    }
  }
}

// this function is to avoid the crop of text when taking screenshots
function overrideStyles(element: HTMLElement) {
  Array.from(element.querySelectorAll<HTMLElement>('*')).forEach((child) => {
    if (getComputedStyle(child).overflow === 'hidden') {
      child.setAttribute('style', 'overflow: visible!important')
    }

    overrideStyles(child)
  })
}
