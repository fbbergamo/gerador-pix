# Gerador Pix

Esta é uma aplicação simples que gera um código QR para pagamento via PIX. É possível personalizar os campos presentes no código, como o valor e a descrição do pagamento.
**Exemplo:** https://www.gerarpix.com.br

## Pré-requisitos

Para executar este projeto, você precisará ter instalado em sua máquina o Node.js na versão 16.14.2.

## Como usar

1. Clone o repositório:

```
git clone https://github.com/fbbergamo/gerador-pix.git
```

2. Navegue até o diretório do projeto:

```
cd gerador-pix
```

3. Instale as dependências:

```
npm install
```

4. Execute o servidor de desenvolvimento com o comando abaixo, isso irá iniciar o servidor de desenvolvimento em `http://localhost:3000`.

```
npm start
```

5. Para a página estática, execute os comandos abaixo:

```
cd website
npx webpack --mode development  --watch
```

6. Acesse o aplicativo no navegador:

Abra o navegador e acesse `http://localhost:3000`. Você deve ver a página inicial do aplicativo.

7. Personalize o código QR:

Preencha os campos do formulário com os detalhes do pagamento. O valor é obrigatório e a descrição é opcional. Clique no botão "Gerar código" para gerar o código QR com base nas informações fornecidas.

8. Visualize o código QR:

O código QR gerado será exibido na tela, juntamente com as informações do pagamento. Você também pode baixar o código QR em formato PNG clicando no botão "Baixar PNG".

## Debug

Caso você queira um exemplo de preenchimento dos campos para gerar o QRCODE, abra o console do seu navegador, coloque o código abaixo e execute:

```
document.getElementById("input-pix-key").value = "(13) 12341-2321";
document.getElementById("input-name").value = "tester";
document.getElementById("input-city").value = "Osasco";
document.getElementById("input-amount").value = "1000";
document.getElementById("input-reference").value = "live";
```

## Tecnologias utilizadas

- React
- QRious
- Express
- html-to-image

## Contribuições

Contribuições são sempre bem-vindas! Se você encontrar um bug ou tiver uma ideia para uma nova funcionalidade, fique à vontade para abrir uma issue ou enviar um pull request.

Todas as contribuições são bem-vindas!

## Licença

Este projeto é licenciado sob a MIT License.
