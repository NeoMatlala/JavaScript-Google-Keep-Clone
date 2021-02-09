// using a class to organize all the behaviour needed for the clone/application

class App {
    // class constructor
    constructor(){
        // storing all our notes inside an array of objects, because we can utilize all the different methods that come with array.
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.title = '';
        this.text = '';
        this.id = '';

        // selectors
        this.$form = document.querySelector('#form') /* form */
        this.$noteTitle = document.querySelector('#note-title') /* note title */
        this.$noteText = document.querySelector('#note-text') /* note body */
        this.$formButtons = document.querySelector('#form-buttons') /* form buttons */
        this.$placeholder = document.querySelector('#placeholder') /* placeholder image */
        this.$notes = document.querySelector('#notes') /* notes container */
        this.$formCloseButton = document.querySelector('#form-close-button') /* button that closes note */
        this.$modal = document.querySelector('.modal') /* Modal element */
        this.$modalTitle = document.querySelector('.modal-title') /* Modal title */
        this.$modalText = document.querySelector('.modal-text') /* Modal text */
        this.$modalCloseButton = document.querySelector('.modal-close-button') /* Modal close button */
        this.$colorTooltip = document.querySelector('#color-tooltip') /* color palletes div */

        this.render();
        this.addEventListeners();
    }

    // app's event listeners
    addEventListeners(){
        // click event(s) on the body
        document.body.addEventListener('click', event => {
            this.handleFormClick(event)
            this.selectNote(event); /* populates notes in modal for editing notes */
            this.openModal(event); /* opens modal */
            this.deleteNote(event); /* deletes note */
        })

        // mouseover event(s)
        document.body.addEventListener('mouseover', event => {
            this.openTooltip(event);
        })
        // mouseout event to close color pallettes
        document.body.addEventListener('mouseout', event => {
            this.closeTooltip(event);
        })

        // keep tooltip open so that colors an be selected
        this.$colorTooltip.addEventListener('mouseover', function() {
            this.style.display = 'flex'
        })

        this.$colorTooltip.addEventListener('mouseout', function() {
            this.style.display = 'none'
        })

        // select and change color of notes
        this.$colorTooltip.addEventListener('click', event => {
            // get color id from the div
            const color = event.target.dataset.color;

            // if we have a color, call function editNoteColor
            if(color){
                this.editNoteColor(color);
            }
        })

        // submit event
        this.$form.addEventListener('submit', event => {
            event.preventDefault();

            const title = this.$noteTitle.value
            const text = this.$noteText.value
            const hasNote = title || text;

            if(hasNote){
                // add note
                this.addNote( {title: title, text: text} );
            }
        })

        // closing note via the close button
        this.$formCloseButton.addEventListener('click', event => {
            event.stopPropagation();
            this.closeForm();
        })

        // closing modal and saving changes/edits to notes
        this.$modalCloseButton.addEventListener('click', event => {
            this.closeModal(event)
        })
    }

    // clicking the form that adds a note
    handleFormClick(event) {
        const isFormClicked = this.$form.contains(event.target);

        const title = this.$noteTitle.value
        const text = this.$noteText.value
        const hasNote = title || text;

        if(isFormClicked){
            //open form
            this.openForm()
        } else if(hasNote) {
            this.addNote({ title, text });
        } else {
            // close form
            this.closeForm()
        }
    }

    // function to open form
    openForm(){
        this.$form.classList.add('form-open')
        this.$noteTitle.style.display = 'block';
        this.$formButtons.style.display = 'block';
    }

    // function to close form
    closeForm() {
        this.$form.classList.remove('form-open')
        this.$noteTitle.style.display = 'none';
        this.$formButtons.style.display = 'none';
        this.$noteTitle.value = '';
        this.$noteText.value = '';
    }

    // method to open modal to edit notes
    openModal(event) {
        // prevent the modal from opening when we delete note
        if(event.target.matches('.toolbar-delete')) return;

        // prevent the modal from opening when we add colors
        if(event.target.matches('.toolbar-color')) return;

        if(event.target.closest('.note')){
            this.$modal.classList.toggle('open-modal');
            this.$modalTitle.value = this.title; 
            this.$modalText.value = this.text; 
        }
    }

    // method that closes modal
    closeModal(event) {
        // edit the note
        this.editNote();
        this.$modal.classList.toggle('open-modal');
    }

    // method to open the tooltip to change colors of notes
    openTooltip(event) {
        if(!event.target.matches('.toolbar-color')) return;

        // get note div
        this.id = event.target.dataset.id;

        // we want to make sure tooltip is always above the pallette icon
        const noteCoords = event.target.getBoundingClientRect();
        /*const horizontal = noteCoords.left + window.scrollX;
        const vertical = noteCoords.top + window.scrollY;*/
        const horizontal = noteCoords.left;
        const vertical = window.scrollY - 20;
        this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`;
        this.$colorTooltip.style.display = 'flex';
    }

    // method to close tooltip when hovering outside it
    closeTooltip(event) {
        if(!event.target.matches('.toolbar-color')) return;
        this.$colorTooltip.style.display = 'none';
    }

    // method that adds a note
    addNote(note) {
        const newNote = {
            title: note.title,
            text: note.text,
            color: '#fff',
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1
        };

        this.notes = [...this.notes, newNote]
        this.render()
        this.closeForm()
    }

    // method that edits notes when modal is open
    editNote(){
        const title = this.$modalTitle.value;
        const text = this.$modalText.value;

        // logic: iterate through our notes array, find that note via its id and add those changes to the note
        this.notes = this.notes.map(note => 
            note.id === Number(this.id) ? {...note, title, text} : note
        )

        this.render()
    }

    // method to give color to the notes based on color pallette selection
    editNoteColor(color){
        this.notes = this.notes.map(note => 
            note.id === Number(this.id) ? {...note, color} : note
        )

        this.render()
    }

    // method that populates modal with selected note data
    selectNote(event){
        // get selected note
        const $selectedNote = event.target.closest('.note')

        // get title & text of the node using array destructuring since we know their position in the array
        if(!this.selectNote) return;
        const [$noteTitle, $noteText] = $selectedNote.children;
        this.title = $noteTitle.innerText; 
        this.text = $noteText.innerText; 
        this.id = $selectedNote.dataset.id;
    }

    // method that deletes notes
    deleteNote(event) {
        // stop propagation/bubbling
        event.stopPropagation();
        
        if(!event.target.matches('.toolbar-delete')) return;

        // to delete a note, we need to know its ID
        const id = event.target.dataset.id;

        // return an array with notes that don't math the deleted id
        this.notes = this.notes.filter(note => note.id !== Number(id));

        // save & display notes
        this.render();
    }

    // so that we dont always have to write two functions evrytime, we can just call on function which will be responsible for both functionalities
    render(){
        this.saveNotes();
        this.displayNotes();
    }

    // save notes to local storage
    saveNotes(){
        localStorage.setItem('notes', JSON.stringify(this.notes))
    }

    // method to display notes in app
    displayNotes() {
        // hide the placeholder img if we have any notes
        const hasNotes = this.notes.length > 0;

        this.$placeholder.style.display = hasNotes ? 'none' : 'flex'

        // iterate through our array to display the notes
        this.$notes.innerHTML = this.notes.map( note => `
            <div style='background: ${note.color};' class='note' data-id='${note.id}'>
                <div class='${note.title && 'note-title'}'> ${note.title} </div>
                <div class='note-text'> ${note.text} </div>
                <div class='toolbar-container'>
                    <div class='toolbar'>
                        <img class="toolbar-color" data-id=${note.id} src="https://icon.now.sh/palette">
                        <img class="toolbar-delete" data-id=${note.id} src="https://icon.now.sh/delete">
                    </div>
                </div>
            </div>
        `).join('')
    }
}

new App()