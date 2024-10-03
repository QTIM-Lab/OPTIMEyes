/* Feeder inherits from default.js */

var PairTaskFeeder = {}; // Meant to be global

function init_app() {
    // debugger
    // Update global app feeder variable
    const config_obj = {
        endpoint_image_list: "image_pair_lists",
        message: "Label frontal and lateral image",
        app: "pair"
    }
    PairTaskFeeder = new TaskFeeder(config_obj);
    // Override methods and attributes of interest

    // - Attributes
    PairTaskFeeder.currentPair = [];
    PairTaskFeeder.nextPair = [];
    PairTaskFeeder.keyboardShortcuts = false; // turn keyboard listener on\off
    PairTaskFeeder.image0Annotation = null;
    PairTaskFeeder.image1Annotation = null;
    PairTaskFeeder.imageSelected = null;

    // - Methods
    PairTaskFeeder.buildUI = function (imageList) {
        if (imageList === "no tasks left") {
            // debugger
            $("#image0").attr('src', "")
            $("#image1").attr('src', "")
            return "no tasks means no UI to build"
        } else {
            // debugger
            this.currentPair = this.imageList[this.currentTask.current_idx]
            //img0
            var idx0 = this.currentPair[0];
            //img1
            var idx1 = this.currentPair[1];

            this.getBase64DataOfImageFromCouch(idx0.toString(), htmlID = "image0")
                .then((response) => {
                    this.getBase64DataOfImageFromCouch(idx1.toString(), htmlID = "image1")
                        .then((response) => {
                            // debugger
                            this.enableButtons();
                        })
                })


        }
    };

    PairTaskFeeder.pairSubmit = function (selection) {
        console.log("pairSubmit");
        var accept_or_reject = 'accept'
        if (selection.id === 'reject-button'){
            accept_or_reject = 'reject'
        }

        // Classifications
        var classification0 = this.image0Annotation
        var classification1 = this.image1Annotation
        
        // qa for acceptance
        if(accept_or_reject === 'accept'){
            if (this.image0Annotation === this.image1Annotation){
                alert("Cannot have the same annotation for each image")
                return "same annotation error"
            } else if (this.image0Annotation === null | this.image1Annotation === null){
                if (this.image0Annotation === null){
                    alert("Left image has no classification")
                    return "image not classified error"
                } else {
                    alert("Right image has no classification")
                    return "image not classified error"
                }
            }
        }

        this.disableButtons();
        // Gather all imageIDs
        TF = this;
        const user = this.user;
        const currentTime = new Date();
        
        const timeStr = currentTime.toString();
        const img0 = `http://${DNS}:${DB_PORT}/${COUCH_DB}/${this.currentPair[0]}`;
        const img1 = `http://${DNS}:${DB_PORT}/${COUCH_DB}/${this.currentPair[1]}`;
        
        // If Tie not mandatory and all submissions require comment or at least an optional comment
        const comment = $("#justification").val();
        const task = this.currentTask._id;
        const task_idx = this.currentTask.current_idx;

        const save_results = {
            user: user,
            type: "pairResult",
            date: timeStr,
            image0: img0,
            image1: img1,
            classification0: classification0,
            classification1: classification1,
            accept_or_reject: accept_or_reject,
            justification: comment,
            task: task,
            task_list_name: this.currentTask.list_name,
            task_idx: task_idx,
        }

        $.ajax({
            url: `http://${DNS}:${HTTP_PORT}/task_results`,
            data: JSON.stringify(save_results),
            dataType: "json",
            type: 'POST',
            contentType: 'application/json',
            success: function (response) {
                // debugger
                console.log('success saving image0')
                // Reset image selections
                $("#image0").removeClass("selected")
                $("#image1").removeClass("selected")
                $("#image0").removeClass("frontal")
                $("#image1").removeClass("frontal")
                $("#image0").removeClass("lateral")
                $("#image1").removeClass("lateral")
                PairTaskFeeder.image0Annotation = null;
                PairTaskFeeder.image1Annotation = null;
                PairTaskFeeder.imageSelected = null;
                // Reset incomplete tasks list
                TF.OnSetUser(TF.user)
            },
            error: function (response) {
                console.log("saving of pairResult failed: " + JSON.stringify(response));
            }
        });
    };


    PairTaskFeeder.commentAlert = function () {
        alert('If you want to provide an optional justification for your decision (left/right/tie), please enter it before you click left/right/tie. The text box will refresh after a decision is made.')
    }

    PairTaskFeeder.initKeyboardListener = function () {
        TF = this;
        document.addEventListener('keydown', function (event) {
            if (!($("#rejectModal").css("display") === "block")) {
                if (TF.keyboardShortcuts === false) {
                    if (event.keyCode == 37) {
                        alert('Left was pressed');
                    }
                    else if (event.keyCode == 39) {
                        alert('Right was pressed');
                    }
                    else if (event.keyCode == 38) {
                        alert('Up was pressed');
                    }

                } else if (TF.keyboardShortcuts === true && document.getElementById('image0').style.pointerEvents === 'auto') {
                    if (event.keyCode == 37) {
                        // PairTaskFeeder.pairSubmit(1)
                        $("#image0").click()
                    }
                    else if (event.keyCode == 39) {
                        $("#reject-button").click()
                        // PairTaskFeeder.pairSubmit(-1)
                    }
                    else if (event.keyCode == 38) {
                        // $('*[data-target="#tieModal"]')[0].click() // for forced tie justification
                        $("#image1").click()
                        // PairTaskFeeder.pairSubmit(0)
                    }
                }
            }
        });
    };

    PairTaskFeeder.toggleKeyboardShortcuts = function () {
        p_mode = document.getElementById('keyboardShortcuts')
        if (this.keyboardShortcuts === true) {
            p_mode.innerHTML = 'Off'
            this.keyboardShortcuts = false
            console.log(p_mode.innerHTML)
            console.log(this.keyboardShortcuts)
        } else {
            p_mode.innerHTML = 'On'
            this.keyboardShortcuts = true
            console.log(p_mode.innerHTML)
            console.log(this.keyboardShortcuts)
        }
    };

    PairTaskFeeder.selectThisImage = function (image) {
        // Sotre currently selected image in current state
        this.imageSelected = image
        // Get image selected
        var img_selected = this.imageSelected.id

        // Clear old selections
        // debugger
        $("#image0").removeClass("selected")
        $("#image1").removeClass("selected")

        // PairTaskFeeder.imageSelected
        $(this.imageSelected).addClass("selected");
        $(this.imageSelected).removeClass("frontal");
        $(this.imageSelected).removeClass("lateral");

        // Assign non-selected image's class that is stored but we are not changing
        if (img_selected === "image0") {
            if (this.image1Annotation != null) {
                $("#image1").addClass(this.image1Annotation);
            }
        } else {
            if (this.image0Annotation != null) {
                $("#image0").addClass(this.image0Annotation);
            }
        }
    };

    PairTaskFeeder.assignClassification = function (button) {
        // debugger;
        // selection qa
        if (this.imageSelected === null) {
            alert("Can\'t classify a non-selected image")
        }

        // Get classification
        var classification = ""
        if (button.id == "frontal-button") {
            classification = "frontal"
        } else {
            classification = "lateral"
        }

        // Get image selected
        var img_selected = this.imageSelected.id

        // Assign annotation in state
        if (img_selected === "image0") {
            this.image0Annotation = classification
        } else {
            this.image1Annotation = classification
        }

        // Assign selected image's class chosen
        $(this.imageSelected).removeClass("selected")
        if (button.id === "frontal-button") {
            $(this.imageSelected).addClass(classification);

        } else if (button.id === "lateral-button") {
            $(this.imageSelected).addClass(classification);
        }

    };

    PairTaskFeeder.enableButtons = function () {
        document.getElementById('image0').style.pointerEvents = 'auto';
        document.getElementById('reject-button').style.pointerEvents = 'auto';
        document.getElementById('image1').style.pointerEvents = 'auto';
    };

    PairTaskFeeder.disableButtons = function () {
        document.getElementById('image0').style.pointerEvents = 'none';
        document.getElementById('reject-button').style.pointerEvents = 'none';
        document.getElementById('image1').style.pointerEvents = 'none';
    };


    /* Begin Compare app specific functionality */
    // debugger
    PairTaskFeeder.setPrompt();
    PairTaskFeeder.handleUrlFilter(document.location.search);
    PairTaskFeeder.initKeyboardListener();


}
