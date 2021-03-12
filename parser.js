const fs = require('fs')

const page = fs.readFileSync('index.html', {
  encoding: 'utf-8'
})

const parser = (string) => {
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

  elements = elements.filter(el => el != '' && el != '\n  ')
  console.log(elements)
}

parser(page)

