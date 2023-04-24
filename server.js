const http = require('http');
const fs = require('fs/promises');

const server = http.createServer((request, response) => {
    const { method, url } = request;
    if (url === '/api' && method === 'GET') {
        response.setHeader('Content-Type', 'application/jason');
        response.statusCode = 200;
        response.write(JSON.stringify({ message: 'Hello!' }));
        response.end();
    };
    if (url === '/api/books' && method === 'GET') {
        fs.readFile('./data/books.json', 'utf8').then((bookData) => {
            const books = JSON.parse(bookData)
            response.setHeader('Content-Type', 'application/jason');
            response.statusCode = 200;
            response.write(JSON.stringify({ books: books }));
            response.end();
        })
    }
})

server.listen(9090, (err) => {
    if (err) console.log(err);
    else console.log('Server Listening on port: 9090')
});