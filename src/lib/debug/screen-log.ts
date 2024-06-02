const ELEMENT_ID = '$$debug$$'
const CLASSNAME = 'screen-log'

export function screenLog(...log: string[]): void {
  const container = document.getElementById(ELEMENT_ID) ?? makeDiv()
  const paragraph = document.createElement('p')
  paragraph.innerText = log.join(' ')
  container.appendChild(paragraph)
}

function makeDiv(): HTMLDivElement {
  const div = document.createElement('div')
  div.id = ELEMENT_ID
  div.className = CLASSNAME
  document.body.appendChild(div)
  return div
}
