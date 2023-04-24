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
        pageUrl = Number(url.match(/[0-9]+/)[0])
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
            if (Object.keys(bookToSend).length === 0) {
                response.setHeader('Conent-Type', 'string');
                response.statusCode = 404;
                response.write('Error - Book not found.')
                response.end();
            } else {
                response.setHeader('Content-Type', 'application/json');
                response.statusCode = 200;
                response.write(JSON.stringify({ book: bookToSend }));
                response.end();
            }
        })
    }
    if (url === '/api/books' && method === 'POST') {
        let body = '';
        let dataIsCorrect = true;
        request.on('data', (packet) => {
            const bookToAdd = JSON.parse(packet.toString());
            if (!bookToAdd.hasOwnProperty('bookTitle') || !bookToAdd.hasOwnProperty('isFiction')) {
                dataIsCorrect = false;
            } else {
                body += packet.toString();
            }
        });
        request.on('end', () => {
            if (!dataIsCorrect) {
                response.setHeader('Content-Type', 'string');
                response.statusCode = 400;
                response.write('Error - To add a new book, it needs to have a "bookTitle" and a "isFiction" property');
                response.end();
            } else {
                fs.readFile('./data/books.json', 'utf8').then((booksData) => {
                    const parsedBooksData = JSON.parse(booksData);
                    const newBook = {bookId: (parsedBooksData.length + 1), ...JSON.parse(body)};
                    const newBooksData = [...parsedBooksData, newBook];
                    fs.writeFile('./data/books.json', JSON.stringify(newBooksData, null, 2))
                    response.setHeader('Content-Type', 'application/json');
                    response.statusCode = 201;
                    response.write(JSON.stringify({ book: newBook }));
                    response.end();
                })
            }
        })
    }
    if (url === `/api/books/${pageUrl}/author` && method === 'GET') {
        fs.readFile('./data/books.json', 'utf8').then((bookData) => {
            const books = JSON.parse(bookData);
            let bookToSend = {};
            books.forEach((book) => {
                if (book.bookId === pageUrl) {
                    bookToSend = book;
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
            if (Object.keys(bookToSend).length === 0) {
                response.setHeader('Conent-Type', 'application/json');
                response.statusCode = 404;
                response.write('Error - Book not found.')
                response.end();
            }
        })
    }
    let searchTerm = '';
    let searchValue = '';
    if (/\?[a-z]+/.test(url)) {
        searchTerm = url.match(/\?[a-z]+/)[0].replace('?', '');
        searchValue = url.match(/\=[a-z]+/)[0].replace('=', '');
    }
    if (url === `/api/books/?${searchTerm}=${searchValue}`) {
        fs.readFile('./data/books.json', 'utf8').then((bookData) => {
            const books = JSON.parse(bookData);
            if (searchTerm === "fiction" && searchValue === 'true') {
                const filteredBooks = books.filter((book) => book.isFiction)
                response.setHeader('Content-Type', 'application/json');
                response.statusCode = 200;
                response.write(JSON.stringify({ books: filteredBooks }));
                response.end();
            } else if (searchTerm === "fiction" && searchValue === 'false') {
                const filteredBooks = books.filter((book) => !book.isFiction)
                response.setHeader('Content-Type', 'application/json');
                response.statusCode = 200;
                response.write(JSON.stringify({ books: filteredBooks }));
                response.end();
            }
        })
    }
})

server.listen(9090, (err) => {
    if (err) console.log(err);
    else console.log('Server Listening on port: 9090')
});