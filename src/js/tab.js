
export const initTab  = () => {
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const sourceCodeModal = document.getElementById('sourceCodeModal');

filterButtons.forEach(button => {
          button.addEventListener('click', () => {
              filterButtons.forEach(btn => btn.classList.remove('active'));
              button.classList.add('active');
              
              const filterValue = button.getAttribute('data-filter');

document.getElementById('viewSourceCodeBtnFour').addEventListener('click', function() {
  // Your logic to open the source code
  console.log('Button clicked!');
});
            
              
              projectCards.forEach(card => {
                  if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                      card.style.display = 'block';
                  } else {
                      card.style.display = 'none';
                  }
              });
          });
      });

document.querySelectorAll("[data-dialog]").forEach(button => {
button.addEventListener("click", ()=> {
  const dialog = document.querySelector(`#${button.dataset.dialog}`);
  dialog.showModal();
  
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  
  dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.matches('.modal::backdrop')) {
          dialog.close();
          document.body.style.removeProperty("overflow");
          document.documentElement.style.removeProperty("overflow");
      }
  });
  
  
  dialog.querySelector(".close-dialog").addEventListener("click", () => {
    dialog.close();
    document.body.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("overflow");
  })
})
})

// Modal functionality for both first and second modals
document.querySelectorAll("[data-dialog], .info-content").forEach(element => {
  // Check if it's the source code link specifically
  if (element.textContent === "Source Code") {
      element.style.cursor = "pointer";
      element.addEventListener("click", () => {
          const sourceCodeModal = document.getElementById("sourceCodeModal");
          sourceCodeModal.showModal();
          
          document.body.style.overflow = "hidden";
          document.documentElement.style.overflow = "hidden";
          
          const closeModalHandler = (event) => {
              if (event.target === sourceCodeModal || event.target.matches('.close-dialog')) {
                  sourceCodeModal.close();
                  document.body.style.removeProperty("overflow");
                  document.documentElement.style.removeProperty("overflow");
                  sourceCodeModal.removeEventListener("click", closeModalHandler);
              }
          };
          
          sourceCodeModal.addEventListener("click", closeModalHandler);
      });
  }
  
  // Existing modal functionality for other elements
  if (element.hasAttribute("data-dialog")) {
      element.addEventListener("click", () => {
          const dialog = document.querySelector(`#${element.dataset.dialog}`);
          dialog.showModal();
          
          document.body.style.overflow = "hidden";
          document.documentElement.style.overflow = "hidden";
          
          const closeDialogHandler = (event) => {
              if (event.target === dialog || event.target.matches('.close-dialog')) {
                  dialog.close();
                  document.body.style.removeProperty("overflow");
                  document.documentElement.style.removeProperty("overflow");
                  dialog.removeEventListener("click", closeDialogHandler);
              }
          };
          
          dialog.addEventListener("click", closeDialogHandler);
      });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const viewSourceBtn = document.getElementById('viewSourceCodeBtn');
  const sourceCodeModal = document.getElementById('sourceCodeModal');
  const closeModalBtn = sourceCodeModal.querySelector('.close-dialog');

  viewSourceBtn.addEventListener('click', () => {
      sourceCodeModal.showModal();
      sourceCodeModal.classList.add('show');
      
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
  });

  closeModalBtn.addEventListener('click', () => {
      sourceCodeModal.classList.remove('show');
      
      // Use setTimeout to allow transition to complete before closing
      setTimeout(() => {
          sourceCodeModal.close();
          document.body.style.removeProperty("overflow");
          document.documentElement.style.removeProperty("overflow");
      }, 300);
  });

  // Close modal when clicking outside
  sourceCodeModal.addEventListener('click', (event) => {
      if (event.target === sourceCodeModal) {
          sourceCodeModal.classList.remove('show');
          setTimeout(() => {
              sourceCodeModal.close();
              document.body.style.removeProperty("overflow");
              document.documentElement.style.removeProperty("overflow");
          }, 300);
      }
  });
});



$(document).ready(function() {

// active classes
var $ExampleHtml = '.sg-example__code__html pre code';
var $DemoArea = '.sg-example__demo .demo-canvas';
var $TabBtn = '.slick-btn';
var $ActiveTab = '.slick-disabled';

// copy demo code into demo area 
$($DemoArea).html($($ExampleHtml).html());

// turn initial html into text
$($ExampleHtml).text($($ExampleHtml).html());

// run highlightjs
$('pre code').each(function(i, block) {
  hljs.highlightBlock(block);
});

// toggle tabs
$($TabBtn).click(function() {
  var tab_id = $(this).attr('data-tab');
  var last_id = $('.tab-content.active').attr('id');

  if (tab_id != last_id) {

    $('.sg-example__code').slideDown('700');
    
    $($TabBtn).removeClass('slick-disabled');
    $('.tab-content').removeClass('active');

    $(this).addClass('slick-disabled');
    $("#" + tab_id).addClass('active');

  } else {
    $('.sg-example__code').slideToggle('700');
  }
})

});
}