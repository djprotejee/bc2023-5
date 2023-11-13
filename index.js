const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'upload/' });
const notesFilePath = 'notes.json';
app.use(express.json());

// Створення JSON файлу, якщо його не існує
if (!fs.existsSync(notesFilePath)) {
    fs.writeFileSync(notesFilePath, '[]', 'utf-8');
}

app.get('/', (req, res) => {
    res.send('Сервер запущений.');
});

// Запит GET /notes
app.get('/notes', (req, res) => {
    if (fs.existsSync(notesFilePath)) {
      const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
      res.json(notes);
    } else {
      res.json([]);
    }
  });

// Запит GET /UploadForm.html
app.get('/UploadForm.html', (req, res) => {
    res.sendFile(__dirname + '/static/UploadForm.html');
});
    
// Запит POST /upload
app.post('/upload', upload.none(), (req, res) => {
    const noteName = req.body.note_name;
    const noteText = req.body.note;

    let notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));

    if (notes.some((note) => note.note_name === noteName)) {
        res.status(400).send('400: Нотатка з таким іменем уже існує.');
    } else {
        const newNote = { note_name: noteName, note_text: noteText };
        notes.push(newNote);

        fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf8');
        res.status(201).send('201: Нотатка створена успішно.');
    }
});

// Запит GET /notes/:noteName
app.get('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;
    const note = JSON.parse(fs.readFileSync(notesFilePath, 'utf8')); 
    
    const foundNote = note.find((data) => data.note_name === noteName);

    if (foundNote) {
        const textFromNote = foundNote.note_text.toString();
        res.status(200).send(textFromNote);
    } else {
        res.status(404).send("404: Нотатки з таким іменем не існує.");
    }
    });

// Запит PUT /notes/:noteName
app.put('/notes/:noteName', express.text(), (req, res) => {
    const noteName = req.params.noteName;
    const updatedNoteText = req.body;

    const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
    const noteToUpdate = notes.find((data) => data.note_name === noteName);

    if (noteToUpdate) {
        noteToUpdate.note_text = updatedNoteText; 
        fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf8');
        res.status(200).send('200: Нотатку оновлено успішно.');
    } else {
        res.status(404).send('404: Нотатки з таким іменем не існує.');
    }
});

// Запит DELETE /notes/:noteName
app.delete('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;

    let notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
    const noteIndex = notes.findIndex((data) => data.note_name === noteName);

    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf8');
        res.status(200).send('200: Нотатку видалено успішно.');
    } else {
        res.status(404).send('400: Нотатки з таким іменем не існує.');
    }
});

// Запуск сервера
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
