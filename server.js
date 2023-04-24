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
    if (url === '/api/authors' && method === 'GET') {
        fs.readFile('./data/authors.json', 'utf8').then((authorData) => {
            const authors = JSON.parse(authorData)
            response.setHeader('Content-Type', 'application/jason');
            response.statusCode = 200;
            response.write(JSON.stringify({ authors: authors }));
            response.end();
        })
    }
    const pageUrl = url.match(/[0-9]/)[0]
    if (url === `/api/books/${pageUrl}` && method === 'GET') {
        fs.readFile('./data/books.json', 'utf8').then((bookData) => {
            const books = JSON.parse(bookData);
            let bookToSend = {};
            books.forEach((book) => {
                if (book.bookId == pageUrl) {
                    bookToSend = book;
                }
            })
            response.setHeader('Content-Type', 'application/jason');
            response.statusCode = 200;
            response.write(JSON.stringify({ book: bookToSend }));
            response.end();
        })
    }
})

server.listen(9090, (err) => {
    if (err) console.log(err);
    else console.log('Server Listening on port: 9090')
});