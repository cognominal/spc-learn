export function highlightElement(prev: HTMLElement | null, el: HTMLElement): HTMLElement {
    unhighlightElement(prev)
    // Find the iframe element in the parent document that contains el
    let iframe: HTMLIFrameElement | null = null
    // Find the iframe by matching its contentDocument
    for (const frame of Array.from(
        window.parent.document.getElementsByTagName('iframe'),
    )) {
        if (frame.contentDocument === el.ownerDocument) {
            iframe = frame
            break
        }
    }


    const elRect = (el as HTMLElement).getBoundingClientRect()
    const doc = el.ownerDocument

    // Calculate the position of el relative to the main window
    const left = elRect.left
    const top = elRect.top

    const elt = doc.createElement('div')
    elt.style.position = 'absolute'
    elt.style.left = `${left}px`
    elt.style.top = `${top}px`
    elt.style.width = `${elRect.width}px`
    elt.style.height = `${elRect.height}px`
    elt.style.pointerEvents = 'none'
    elt.style.background = 'transparent'
    elt.style.border = '2px solid red'
    elt.style.zIndex = '9999'
    doc.body.appendChild(elt)
    return elt
}

export function unhighlightElement(elt: HTMLElement | null) {
    if (elt) {
        elt.remove()
        elt = null
    }
}
