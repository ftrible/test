Exercise using Node.js and OpenAI API
[Open AI Chat API](https://platform.openai.com/docs/api-reference/chat)
[Open AI Image API](https://platform.openai.com/docs/api-reference/images)
 
Note: For the future (https server todo) SSL cert:
#openssl genrsa -out client-key.pem 2048
#openssl req -new -key client-key.pem -out client.csr
#openssl x509 -req -in client.csr -signkey client-key.pem -out client-cert.pem

openssl req -x509 -out client-cert.pem -keyout client-key.pem \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

