
import { name } from './main.ts'
const serverURL = document.location.origin 
let pre: HTMLPreElement
let msgInput: HTMLInputElement
let sendBtn: HTMLButtonElement

// initialize our dom element references and handlers
export const init = () => {
   pre = document.getElementById('pre') as HTMLPreElement
   msgInput = document.getElementById('msg') as HTMLInputElement

   msgInput.addEventListener('change', () => {
      sendIt(msgInput.value)
   })


   sendBtn = document.getElementById('send') as HTMLButtonElement
   sendBtn.addEventListener('click', () => {
      if (msgInput.value.length) sendIt(msgInput.value);
   })
   pre.textContent = ""
}

export const display = (what: string) => {
   pre.textContent = `${what}
` + pre.textContent;
}

const sendIt = (thisMsg: string) => {
   console.info('sending: ', thisMsg)
   if (msgInput.value.length > 0) {
      display(`${name} >> ${thisMsg}`)
      fetch(serverURL + "/", {
         method: "POST",
         mode: 'cors',
         body: JSON.stringify({topic: "msg", data:{from: name, msg: thisMsg}})
      });
      msgInput.value = ""
   }
}
