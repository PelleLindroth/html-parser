const util = require('util')
const fs = require('fs')
const page = fs.readFileSync('index.html', {
  encoding: 'utf-8'
})

const parseHTMLString = string => {
  let inside = false
  const root = {}
  let elements = []
  let currentTag = ''
  let innerText = ''
  for (let char of string) {

    if (char === '<') {
      inside = true
    } else if (char === '>') {
      currentTag += char
      inside = false
    }

    if (inside) {
      elements.push(innerText)
      currentTag += char
      innerText = ''
    } else {
      elements.push(currentTag)
      currentTag = ''

      if (char != '>') {
        innerText += char
      }
    }
  }

  elements = elements.filter(el => el != '' && !el.includes('\n'))
  return elements
}

const createObject = node => {
  let [tag, ...attributes] = node.split(' ')

  return {
    tag: tag.slice(1).replace('>', ''),
    attributes: parseAttributes(attributes.join(' ').slice(0, -1)),
    children: []
  }
}

const parseAttributes = string => {
  const attributes = []
  let isKey = true
  let key = ''
  let value = ''
  let inQuotes = false

  for (let char of string) {
    if (isKey) {
      if (char === '=') {
        isKey = false
      } else {
        key += char
      }
    } else {
      if (char === '"') {
        inQuotes = !inQuotes
      }
      if (inQuotes) {
        value += char
      } else {
        key = key.replace("'", "").trim()
        value = value.replace('"', '').replace('"', '')
        attributes.push({ [key]: value })
        key = ''
        value = ''
        isKey = true
      }
    }
  }

  return attributes
}

const increaseCount = (count, returnNode) => {
  if (returnNode && returnNode.distance) {
    if (returnNode.distance < 0) {
      returnNode.distance = 0
    }
    count += returnNode.distance
    delete returnNode.distance
  } else {
    count++
  }

  return count
}

const buildTree = nodes => {
  if (!nodes.length || nodes[0].startsWith('</')) { return }
  if (nodes[0].startsWith('<!')) {
    nodes = nodes.slice(1)
  }

  const node = nodes[0]
  if (node.startsWith('<')) {
    const nodeObject = createObject(node)
    let count = 1
    nodeObject.distance = nodes.findIndex(el => el === `</${nodeObject.tag}>`)

    while (count < nodeObject.distance) {
      let returnNode = buildTree(nodes.slice(count + nodeObject.children.length))
      count = increaseCount(count, returnNode)
      if (count > nodeObject.distance) {
        break
      }
      if (typeof returnNode === 'string') {
        nodeObject.innerText = returnNode
      } else {
        if (typeof returnNode === 'object') {
          nodeObject.children.push(returnNode)
        }
      }
    }
    return nodeObject
  } else {
    return node
  }
}

const nodeArray = parseHTMLString(page)
const virtualDOM = buildTree(nodeArray)
console.log(util.inspect(virtualDOM, { depth: null, colors: true }))