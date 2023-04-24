const http = require('http');
const fs = require('fs/promises');

const server = http.createServer((request, response) => {
    const { method, url } = request;
    if (url === '/api' && method === 'GET') {
        response.setHeader('Content-Type', 'application/json');
        response.statusCode = 200;
        response.write(JSON.stringify({ message: 'Hello!' }));
        response.end();
    };
    if (url === '/api/books' && method === 'GET') {
        fs.readFile('./data/books.json', 'utf8').then((bookData) => {
            const books = JSON.parse(bookData)
            response.setHeader('Content-Type', 'application/json');
            response.statusCode = 200;
            response.write(JSON.stringify({ books: books }));
            response.end();
        })
    }
    if (url === '/api/authors' && method === 'GET') {
        fs.readFile('./data/authors.json', 'utf8').then((authorData) => {
            const authors = JSON.parse(authorData)
            response.setHeader('Content-Type', 'application/json');
            response.statusCode = 200;
            response.write(JSON.stringify({ authors: authors }));
            response.end();
        })
    }
    let pageUrl = 0;
    if (/[0-9]/.test(url)){
        pageUrl = Number(url.match(/[0-9]/)[0])
    } 
    if (url === `/api/books/${pageUrl}` && method === 'GET') {
        fs.readFile('./data/books.json', 'utf8').then((bookData) => {
            const books = JSON.parse(bookData);
            let bookToSend = {};
            books.forEach((book) => {
                if (book.bookId === pageUrl) {
                    bookToSend = book;
                }
            })
            response.setHeader('Content-Type', 'application/json');
            response.statusCode = 200;
            response.write(JSON.stringify({ book: bookToSend }));
            response.end();
        })
    }
    if (url === '/api/books' && method === 'POST') {
        let body = '';
        request.on('data', (packet) => {
            body += packet.toString();
        });
        request.on('end', () => {
            fs.readFile('./data/books.json', 'utf8').then((booksData) => {
                const parsedBooksData = JSON.parse(booksData);
                const newBook = {bookId: (parsedBooksData.length + 1), ...JSON.parse(body)};
                const newBooksData = [...parsedBooksData, newBook];
                response.setHeader('Content-Type', 'application/json');
                response.statusCode = 201;
                response.write(JSON.stringify({ book: newBook }));
                response.end();
            })
        })
    }
    if (url === `/api/books/${pageUrl}/author` && method === 'GET') {
        console.log(pageUrl)
        fs.readFile('./data/books.json', 'utf8').then((bookData) => {
            const books = JSON.parse(bookData);
            books.forEach((book) => {
                if (book.bookId === pageUrl) {
                    console.log(book.authorId)
                    fs.readFile('./data/authors.json', 'utf8').then((authorData) => {
                        const parsedAuthorData = JSON.parse(authorData);
                        parsedAuthorData.forEach((author) => {
                            if (book.authorId === author.authorId) {
                                response.setHeader('Content-Type', 'application/json');
                                response.statusCode = 200;
                                response.write(JSON.stringify({ author: author }));
                                response.end();
                            }
                        })

                    })
                }
            })
        })
    }
})

server.listen(9090, (err) => {
    if (err) console.log(err);
    else console.log('Server Listening on port: 9090')
});