Exercise using Node.js and OpenAI API
[Open AI Chat API](https://platform.openai.com/docs/api-reference/chat)
[Open AI Image API](https://platform.openai.com/docs/api-reference/images)
 
Note: For the future (https server todo) SSL cert:
openssl genrsa -out client-key.pem 2048
openssl req -new -key client-key.pem -out client.csr
openssl x509 -req -in client.csr -signkey client-key.pem -out client-cert.pem

