# gerador-pix

Exemplo para geracao de QRCode PIX padrão BRCODE https://www.gerarpix.com.br/

## Setup

Instalar Nodejs, versão no `.tool-versions`

Servidor

```
npm install

npm start
```


Página estática

Webpack Watcher - Compilador de JS e CSS

```
cd website
npx webpack --mode development  --watch
```


### Debug

Código js para testar a tela

```
document.getElementById("input-pix-key").value = "(13) 12341-2321"; document.getElementById("input-name").value = "tester"; document.getElementById("input-city").value = "Osasco"; document.getElementById("input-amount").value = "1000";  document.getElementById("input-reference").value = "live";
```
