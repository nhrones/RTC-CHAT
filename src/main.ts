// deno-lint-ignore-file no-explicit-any
import { on, fire } from './client_deps.ts'
import * as signaler from './client_deps.ts'

import * as dom from './dom.ts';
import { generateName } from './names.ts';

// create a unique Chat name
export const name = generateName();
console.log("started - ", name);

dom.init();

// initialize signal service communications
signaler.initialize(name, name)

// show any popup messages from peers
signaler.onEvent('ShowPopup', (data: any) => {
   fire('ShowPopup', data)
})

// this will register this user locally and with any peer
fire('SetID', { id: name, name: name })
