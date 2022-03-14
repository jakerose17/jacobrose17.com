window.addEventListener("load", main);

function main() {
  /* ------------------------------------------------------------------- */
  /*                      Function to add floating navbar                */
  /* ------------------------------------------------------------------- */
  window.addEventListener('scroll', function(){setFloat()});
  var navbar = document.getElementById('navbar');
  // var navimg = document.getElementById('navImg');
  var header = document.getElementById('header');
  var offset = navbar.offsetTop;
  function setFloat(){
    if (window.pageYOffset>=offset){
      navbar.classList.add('sticky');
      // navimg.classList.add('sticky');
      header.style.marginBottom='5vw';
    }
    else{
      navbar.classList.remove('sticky');
      // navimg.classList.remove('sticky');
      header.style.marginBottom='20px';
    }
  }


  /* ---------------------------------------------------------------------------------- */
  /*                                Initilizing Variables                               */
  /* ---------------------------------------------------------------------------------- */
  var answerValues = [ // master array for JS
    /*Q0*/[[0,1,2,3,4,5,9],[6,7,8,15,16,17,18,19],[13,14,10,11,12, 15]],
    /*Q1*/[[1,13,14],[2,3,4,6,7,12,9,15,16,17,18,19],[0,5,10,11,8]],
    /*Q2*/[[6,7,8,16,17,18],[3,4,5,12,13],[0,1,2,14,15],[9,10,11,19]],
    /*Q3*/[[1,8,4,15,18],[9,2,5,6,16,17],[10,11,12,13],[0,3,7,14,19]],
    /*Q4*/[[9,12,18],[0,1,2,3,4,5,6,7,8,10,11,13,14,15,16,17,19]],
    /*Q5*/[[0,4,9,7],[1,6,19,15,17],[2,5,3,8,10,11,12,13],[14,16,18]],
    /*Q6*/[[5,4,9,11,16,19],[2,6,10,15],[3,8,13,1,18],[0,7,12,14,17]],
    /*Q7*/[[10,11,3,19],[1,4,12,13],[2,6,7,8,9,0,5,14,15,16,17,18]],
    /*Q8*/[[2,10,13,19],[1,6,8,14,18],[4,16],[0,5,15],[3,11,17],[7,9,12]],
    /*Q9*/[[4,5,11,17,3],[1,6,7,12,16,18],[0,8,9,13,15],[2,10,14,19]],
    /*Q10*/[[4,12,3],[5,1,14,13,15],[6,10,18,8],[7,19],[11,16],[0,2,9,17]],
    /*Q11*/[[2,18,19,9],[8,11,13,0,4,15],[6,7,16,5,1,12],[10,14,3,17]],
    /*Q12*/[[0,6,14],[1,7,15],[2,8,16],[3,9,17],[4,10,18,12],[5,11,19,13]],
    /*Q13*/[[5,19,13],[4,18,12],[3,17,11],[2,16,10,6],[1,15,9,7],[0,14,8]],
    /*Q14*/[[2,18,19,11,9],[0,1,7,8],[3,4,5,6,10,12,13,14,15,16,17]]
  ];

  /* ------------------------------------ Halls ---------------------------------------- */
  var halls = ['1st Beall', '2nd Beall', '3rd Beall', '2nd Bryan', '3rd Bryan', '4th Bryan', 'Greynolds', 'Reynolds 1C2C1D', 'Reynolds 1E2E2D', 'Royall', '1st Hill', '2nd Hill', '1st Hunt', 'Hunt Annex', 'Hunt 2nd West', 'Hunt 2nd East', 'Hunt 3rd West', 'Hunt 3rd East', 'Hunt 4th West', 'Hunt 4th East'];
  /*                0             1            2           3            4            5           6                 7                  8              9        10          11          12            13              14              15                16                17             18               19*/
  var hallCounts = new Array(halls.length).fill(0);

  /* ------------------------------ Question information ------------------------------ */
  //This creates an array of the number of answer choices in each question for later loops
  var arrayOfAnsChoices = new Array(answerValues.length);
  for (i=0;i<answerValues.length;i++){
    arrayOfAnsChoices[i]=answerValues[i].length;
  };
  //This sets the maximum number of answer choices for later loops initilizing variables
  var maxNumOfAnsChoices = Math.max(...arrayOfAnsChoices);

  /* ------------------------------ Initilizing Buttons for page ------------------------------ */
  // This creates an array with length of the number of questions
  var a = new Array(answerValues.length);
  // creates arrays within the array with length of maximum number of answer choices
  for (i=0;i<a.length;i++){
    a[i] = new Array(arrayOfAnsChoices[i]);
  };
  // assigns each id to each location in the array
  for (i=0;i<answerValues.length;i++){
    for (j=0;j<=arrayOfAnsChoices[i];j++){
      a[i][j] = document.getElementById(`q${i}a${j}`);
    };
  };
  /* ------------------------------ Initilizing dots for page ------------------------------ */
  // This creates an array with length of the number of questions
  var dots = new Array(answerValues.length);
  // creates arrays within the array with length of maximum number of answer choices
  for (i=0;i<dots.length;i++){
    dots[i] = new Array(arrayOfAnsChoices[i]);
  };
  // assigns each id to each location in the array
  for (i=0;i<answerValues.length;i++){
    for (j=0;j<arrayOfAnsChoices[i];j++){
      dots[i][j] = document.getElementById(`q${i}a${j}rad`);
    };
  };


  /* -------------------------------------------------------------------------------------------- */
  /*                                Event Listeners for all buttons                               */
  /* -------------------------------------------------------------------------------------------- */
  // Funtion to add an event listener to the question and answer passed in
  function add(question, answer){
    a[question][answer].addEventListener('click', function(){
      select(question,answer);
    });
  };
  // Loop that adds an event listener to each question and answer
  for (i=0;i<answerValues.length;i++){
    for (j=0;j<arrayOfAnsChoices[i];j++){
      add(i,j);
    };
  };

  /* ------------------------------------------------------------------------------------------------- */
  /*                      Function to visually select user answer choice                               */
  /* ------------------------------------------------------------------------------------------------- */
  // Function that intakes the question number and answer number to highlight the correct answer and choose the button
  function select(question, answer){
    a[question][answer].classList.add('selected');
    dots[question][answer].checked = true;
    for (i=0;i<arrayOfAnsChoices[question];i++){
      if (i!=answer){
        a[question][i].classList.remove('selected');
      };
    };
  };

  /* ----------------------------------------------------------------------------------- */
  /*                      Function to score answer choices and alert user                */
  /* ----------------------------------------------------------------------------------- */
  // Adds a listener for the calculate results button
  document.getElementById('calcResults').addEventListener('click', function(){
    calcResults();
  });

  // Creates a function to loop through every answer on the page, check if the radio input is checked, and add one point to each hall that is chosen
  function calcResults(){
    var numChecked = 0;
    for (i=0;i<answerValues.length;i++){
      for (j=0;j<arrayOfAnsChoices[i];j++){
        if (dots[i][j].checked){
          numChecked++;
          for (k=0;k<answerValues[i][j].length;k++){
            hallCounts[answerValues[i][j][k]]++;
          };
        };
      };
    };
    // checks to see if the user has answered all questions
    if (numChecked!=answerValues.length){
      swal("You haven't answered all of the questions!",'');
      var negAudio = new Audio('audio/computerErrorAlert.mp3');
      var posAudio = new Audio(' ');

      posAudio.play();
      negAudio.currentTime=0
      negAudio.play();
      negAudio.currentTime=0;
    }
    else{
      //var audio = new Audio('audio/cartoon_success_fanfair.mp3');
      audio.play();
      var girlhalls = halls.slice(0,10);
      var guyhalls = halls.slice(10,19);
      var girlScores = hallCounts.slice(0,10);
      var guyScores = hallCounts.slice(10,19);
      var maxGirlScore = Math.max(...girlScores);
      var maxGuyScore = Math.max(...guyScores);
      var girlHallsMatch = new Array();
      var guyHallsMatch = new Array();
      for (i=0;i<girlScores.length;i++){
        if (girlScores[i]==maxGirlScore){
          girlHallsMatch.push(girlhalls[i]);
        };
      };
      for (i=0;i<guyScores.length;i++){
        if (guyScores[i]==maxGuyScore){
          guyHallsMatch.push(guyhalls[i]);
        }
      };
      swal(`You would fit on:`, `Girl Halls: ${girlHallsMatch.join(', ')} \r\n Guy Halls: ${guyHallsMatch.join(', ')}`);
    };
  };
};
