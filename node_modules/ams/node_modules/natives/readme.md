## Require all nodes builtin modules (natives) in one go.

## Features
- no need to require each native separate anymore
- all natives packed in one object
- no namespace conflicts with natives in user code
- no negative performance impacts if using it

## Installation
	$ npm install natives
	
## Usage

	var n = require('natives');
	
	// now use any native method
	n.path.join(__dirname, '..');
	