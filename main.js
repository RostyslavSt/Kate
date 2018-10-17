let str = 'a(3)dsfb(2)asd'

function replace(str) {
  let result = ''
  let number = ''

  for (let i = 0; i < str.length; i++) {
    if (isNaN(str[i])) {
      if ((str[i] == "(") || (str[i] == ")")) continue;
      if (number) {
        let lastChar = result[result.length - 1]
        let repeatedChar = ''
        for (let i = 1; i < +number; i++) {
          repeatedChar += lastChar
        }
        number = ''
        result += repeatedChar
      }
      result += str[i]
    } else {
      number += str[i]
    }
  }

  return result
}

console.log(replace(str));