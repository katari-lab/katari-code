clean:	
	- npm prune

dependencies:
	- npm install
	- npm audit fix
	- npm update

package:
	- vsce package