const http = require('http');
const fs = require('fs/promises');


const server = http.createServer((request, response) => {

    function model(contentType, statusCode, message) {
        response.setHeader('Content-Type', contentType);
        response.statusCode = statusCode;
        response.write(message);
        response.end();
    }

    const { method, url } = request;

    let searchTerm = '';
    let searchValue = '';
    if (/\?[a-z]+/.test(url)) {
        searchTerm = `/${url.match(/\?[a-z]+/)[0]}`;
        searchValue = url.match(/\=[a-z]+/)[0];
    }
    let pageUrl = 0;
    if (/[0-9]/.test(url)){
        pageUrl = Number(url.match(/[0-9]+/)[0])
    } 
    
    if (method === 'GET') {
        if (url === '/api') {
            model(
                'application/json', 
                200, 
                JSON.stringify({ message: 'Hello!' })
            )
        };
        if (url === `/api/books${searchTerm}${searchValue}`) {
            fs.readFile('./data/books.json', 'utf8').then((bookData) => {
                const books = JSON.parse(bookData)
                if (searchTerm !== '' && searchValue !== '') {
                    if (searchTerm.replace('/?', '') === "fiction" && (searchValue.replace('=', '') !== 'true' && searchValue.replace('=', '') !== 'false')) {
                        model(
                            'string', 
                            406, 
                            'Error, incorrect search value - Please use either "true" or "false" when using the search term: "isFiction".'
                        );
                    } else if (searchTerm.replace('/?', '') === "fiction" && searchValue.replace('=', '') === 'true') {
                        const filteredBooks = books.filter((book) => book.isFiction)
                        model(
                            'application/json',
                            200,
                            JSON.stringify({ books: filteredBooks })
                        );
                    } else if (searchTerm.replace('/?', '') === "fiction" && searchValue.replace('=', '') === 'false') {
                        const filteredBooks = books.filter((book) => !book.isFiction)
                        model(
                            'application/json',
                            200,
                            JSON.stringify({ books: filteredBooks })
                        );
                    }; 
                } else {
                    model(
                        'application/json',
                        200,
                        JSON.stringify({ books: books })
                    );
                };
            });
        };
        if (url === '/api/authors') {
            fs.readFile('./data/authors.json', 'utf8').then((authorData) => {
                const authors = JSON.parse(authorData)
                model(
                    'application/json', 
                    200, 
                    JSON.stringify({ authors: authors })
                );
            });
        };
        if (url === `/api/books/${pageUrl}`) {
            fs.readFile('./data/books.json', 'utf8').then((bookData) => {
                const books = JSON.parse(bookData);
                let bookToSend = {};
                books.forEach((book) => {
                    if (book.bookId === pageUrl) {
                        bookToSend = book;
                    }
                })
                if (Object.keys(bookToSend).length === 0) {
                    model(
                        'string', 
                        404, 
                        'Error - Book not found.'
                    )
                } else {
                    model(
                        'application/json', 
                        200, 
                        JSON.stringify({ book: bookToSend })
                    );
                };
            });
        };
        if (url === `/api/books/${pageUrl}/author`) {
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
                                    model(
                                        'application/json', 
                                        200, 
                                        JSON.stringify({ author: author })
                                    );
                                } ;
                            });
                        });
                    } ;
                });
                if (Object.keys(bookToSend).length === 0) {
                    model(
                        'string', 
                        404, 
                        'Error - Book not found.'
                    );
                };
            });
        };
    } else if (method === 'POST') {
        if (url === '/api/books') {
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
                    model(
                        'string', 
                        400, 
                        'Error - To add a new book, it needs to have a "bookTitle" and a "isFiction" property'
                    );
                } else {
                    fs.readFile('./data/books.json', 'utf8').then((booksData) => {
                        const parsedBooksData = JSON.parse(booksData);
                        const newBook = {bookId: (parsedBooksData.length + 1), ...JSON.parse(body)};
                        const newBooksData = [...parsedBooksData, newBook];
                        fs.writeFile('./data/books.json', JSON.stringify(newBooksData, null, 2))
                        model(
                            'application/json', 
                            201, 
                            JSON.stringify({ book: newBook })
                        );
                    });
                };
            });
        };
    };
});

server.listen(9090, (err) => {
    if (err) console.log(err);
    else console.log('Server Listening on port: 9090')
});