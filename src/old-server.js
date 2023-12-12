/////////////////////////////////////////////////////////////GET



app.get("/books", (req, res) => {
  let books = JSON.parse(fs.readFileSync("text.txt"));
  let newBooks = []

  // if (req.query.name) {
  //   books = books.filter(
  //     (books) => books.name.toLowerCase().indexOf(req.query.name) >= 0
  //   );

  //   books.forEach((element,index) => {
  //     newBooks[index] = {
  //       id : books[index].id,
  //       name : books[index].name,
  //       publisher : books[index].publisher
  //     }
  //   })

  //   return response(200, res, "success", "menampilkan buku", { books : newBooks });
  // }

  // if (req.query.reading) {
  //   books = req.query.reading.indexOf("1")
  //     ? books.filter((books) => !books.reading)
  //     : books.filter((books) => books.reading);

  //     books.forEach((element,index) => {
  //       newBooks[index] = {
  //         id : books[index].id,
  //         name : books[index].name,
  //         publisher : books[index].publisher
  //       }
  //     })

  //   return response(
  //     200,
  //     res,
  //     "success",
  //     `menampilkan buku yang ${
  //       req.query.reading.indexOf("1") ? "tidak" : "sedang"
  //     } dibaca`,
  //     { books : newBooks }
  //   );
  // }

  // if (req.query.finished) {
  //   books = req.query.finished.indexOf("1")
  //     ? books.filter((books) => !books.finished)
  //     : books.filter((books) => books.finished);

  //     books.forEach((element,index) => {
  //       newBooks[index] = {
  //         id : books[index].id,
  //         name : books[index].name,
  //         publisher : books[index].publisher
  //       }
  //     })

  //   return response(
  //     200,
  //     res,
  //     "success",
  //     `menampilkan buku yang ${
  //       req.query.finished.indexOf("1") ? "belum" : "sudah"
  //     } selesai dibaca`,
  //     { books : newBooks }
  //   );
  // }

  books.forEach((element,index) => {
    newBooks[index] = {
      id : books[index].id,
      name : books[index].name,
      publisher : books[index].publisher
    }
  })

  response(200,res,"success","menampilkan semua buku", {books : newBooks})
});

/////////////////////////////////////////////////////////////GET

app.get("/books/:bookId", (req, res) => {
  let book = JSON.parse(fs.readFileSync("text.txt")).filter(
    (books) => books.id.toLowerCase() === req.params.bookId.toLowerCase()
  )

  book == false
    ? response(404, res, "fail", "Buku tidak ditemukan")
    : response(200, res, "success", "buku ditemukan", {book : book[0]});
});

/////////////////////////////////////////////////////////////POST

app.post("/books", (req, res) => {
  const { name, pageCount, readPage, reading } = req.body;
  let finished,
    randomId = nanoId(),
    insertedAt = date.toISOString(),
    updatedAt = date.toISOString();


  try {
    if (!name) throw "Gagal menambahkan buku. Mohon isi nama buku";
    if (readPage > pageCount)
      throw "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount";
  } catch (err) {
    return response(400, res, "fail", err);
  }

  readPage == pageCount ? (finished = true) : (finished = false);

  const book = {
    id: randomId,
    ...req.body,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  const books = JSON.parse(fs.readFileSync("text.txt"));
  books.push(book);
  fs.writeFileSync("text.txt", JSON.stringify(books));
  return response(201, res, "success", "Buku berhasil ditambahkan", {
    bookId: randomId,
  });
});

/////////////////////////////////////////////////////////////PUT

app.put("/books/:bookId", (req, res) => {
  const { name, pageCount, readPage, reading } = req.body;
  let books = JSON.parse(fs.readFileSync("text.txt"));
  let oldBook = books.filter(
    (books) => books.id.toLowerCase() === req.params.bookId.toLowerCase()
  )

  try {
    if (!name) throw [400,"Gagal memperbarui buku. Mohon isi nama buku"];
    if (readPage > pageCount)
      throw [400,"Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"];
    if(books.filter(
      (books) => books.id.toLowerCase() === req.params.bookId.toLowerCase()
    ) == false) throw [404 , "Gagal memperbarui buku. Id tidak ditemukan"]
  } catch (err) {
    return response(err[0], res, "fail", err[1]);
  }

  let finished,
  updatedAt = date.toISOString(),
  {id , insertedAt} = oldBook[0]

  readPage == pageCount ? (finished = true) : (finished = false);

  let newBook = [{
    id : req.params.bookId,
    ...req.body,
    finished,
    reading,
    insertedAt,
    updatedAt
  }]

  books = [
    ...books.slice(
      0,
      books.findIndex(
        (books) => books.id.toLowerCase() == req.params.bookId.toLowerCase()
      )
    ),
    ...newBook,
    ...books.slice(
      books.findIndex(
        (books) => books.id.toLowerCase() == req.params.bookId.toLowerCase()
      ) + 1,
      books.length
    ),
  ]

  response(200,res,"success","Buku berhasil diperbarui")
  fs.writeFileSync("text.txt", JSON.stringify(books));
});

/////////////////////////////////////////////////////////////DELETE

app.delete("/books/:bookId", (req, res) => {
  let books = JSON.parse(fs.readFileSync("text.txt"));

  if (
    books.findIndex(
      (books) => books.id.toLowerCase() == req.params.bookId.toLowerCase()
    ) == -1
  )
    return response(404, res, "fail", "Buku gagal dihapus. Id tidak ditemukan");

  books = [
    ...books.slice(
      0,
      books.findIndex(
        (books) => books.id.toLowerCase() == req.params.bookId.toLowerCase()
      )
    ),
    ...books.slice(
      books.findIndex(
        (books) => books.id.toLowerCase() == req.params.bookId.toLowerCase()
      ) + 1,
      books.length
    ),
  ];

  fs.writeFileSync("text.txt", JSON.stringify(books));
  response(200, res, "success", "Buku berhasil dihapus");
});

/////////////////////////////////////////////////////////////LISTEN

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});