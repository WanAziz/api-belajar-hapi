const fs = require("node:fs");
const { customAlphabet } = require("nanoid");
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoId = customAlphabet(alphabet, 15);
const date = new Date();

const sendJson = (statusCode, h, ...text) => {
  const [status, message, data] = text;

  return h
    .response({
      status,
      message,
      data,
    })
    .code(statusCode);
};

("use strict");

const Hapi = require("@hapi/hapi");
const { send } = require("node:process");

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: "localhost",
  });

  server.route({
    method: "GET",
    path: "/books",
    handler: function (request, h) {
      let books = JSON.parse(fs.readFileSync("text.txt"));
      let newBooks = [];

      books.forEach((element, index) => {
        newBooks[index] = {
          id: books[index].id,
          name: books[index].name,
          publisher: books[index].publisher,
        };
      });

      return sendJson(200, h, "success", "menampilkan semua buku", {
        books: newBooks,
      });
    },
  });

  server.route({
    method: "GET",
    path: "/books/{bookId}",
    handler: function (request, h) {
      let book = JSON.parse(fs.readFileSync("text.txt")).filter(
        (books) =>
          books.id.toLowerCase() === request.params.bookId.toLowerCase()
      );

      if (book == false) {
        return sendJson(404, h, "fail", "Buku tidak ditemukan");
      } else {
        return sendJson(200, h, "success", "buku ditemukan", { book: book[0] });
      }
    },
  });

  server.route({
    method: "POST",
    path: "/books",
    handler: function (request, h) {
      const { name, pageCount, readPage, reading } = request.payload;
      let finished,
        randomId = nanoId(),
        insertedAt = date.toISOString(),
        updatedAt = date.toISOString();

      try {
        if (!name) throw "Gagal menambahkan buku. Mohon isi nama buku";
        if (readPage > pageCount)
          throw "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount";
      } catch (err) {
        return sendJson(400, h, "fail", err);
      }

      readPage == pageCount ? (finished = true) : (finished = false);

      const book = {
        id: randomId,
        ...request.payload,
        finished,
        reading,
        insertedAt,
        updatedAt,
      };

      const books = JSON.parse(fs.readFileSync("text.txt"));
      books.push(book);
      fs.writeFileSync("text.txt", JSON.stringify(books));
      return sendJson(201, h, "success", "Buku berhasil ditambahkan", {
        bookId: randomId,
      });
    },
  });

  server.route({
    method: "PUT",
    path: "/books/{bookId}",
    handler: function (request, h) {
      const { name, pageCount, readPage, reading } = request.payload;
      let books = JSON.parse(fs.readFileSync("text.txt"));
      let oldBook = books.filter(
        (books) => books.id.toLowerCase() === request.params.bookId.toLowerCase()
      );

      try {
        if (!name) throw [400, "Gagal memperbarui buku. Mohon isi nama buku"];
        if (readPage > pageCount)
          throw [
            400,
            "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
          ];
        if (
          books.filter(
            (books) =>
              books.id.toLowerCase() === request.params.bookId.toLowerCase()
          ) == false
        )
          throw [404, "Gagal memperbarui buku. Id tidak ditemukan"];
      } catch (err) {
        return sendJson(err[0], h, "fail", err[1]);
      }

      let finished,
        updatedAt = date.toISOString(),
        { id, insertedAt } = oldBook[0];

      readPage == pageCount ? (finished = true) : (finished = false);

      let newBook = [
        {
          id: request.params.bookId,
          ...request.payload,
          finished,
          reading,
          insertedAt,
          updatedAt,
        },
      ];

      books = [
        ...books.slice(
          0,
          books.findIndex(
            (books) => books.id.toLowerCase() == request.params.bookId.toLowerCase()
          )
        ),
        ...newBook,
        ...books.slice(
          books.findIndex(
            (books) => books.id.toLowerCase() == request.params.bookId.toLowerCase()
          ) + 1,
          books.length
        ),
      ];

      fs.writeFileSync("text.txt", JSON.stringify(books));
      return sendJson(200, h, "success", "Buku berhasil diperbarui");
    },
  });

  server.route({
    method: "DELETE",
    path: "/books/{bookId}",
    handler: function (request, h) {
      let books = JSON.parse(fs.readFileSync("text.txt"));

      if (
        books.findIndex(
          (books) => books.id.toLowerCase() == request.params.bookId.toLowerCase()
        ) == -1
      )
        return sendJson(404, h, "fail", "Buku gagal dihapus. Id tidak ditemukan");
    
      books = [
        ...books.slice(
          0,
          books.findIndex(
            (books) => books.id.toLowerCase() == request.params.bookId.toLowerCase()
          )
        ),
        ...books.slice(
          books.findIndex(
            (books) => books.id.toLowerCase() == request.params.bookId.toLowerCase()
          ) + 1,
          books.length
        ),
      ];
    
      fs.writeFileSync("text.txt", JSON.stringify(books));
      return sendJson(200, h, "success", "Buku berhasil dihapus");
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
