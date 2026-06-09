const graphicTab = document.querySelector('#graphicTab');
const campaignTab = document.querySelector('#campaignTab');

const graphicContainer = document.querySelector('#graphic-container');
// const campaignContainer = document.querySelector('#campaign-container');

graphicTab.addEventListener('click',()=>{
    campaignContainer.style.display = 'none';
    graphicContainer.style.display = 'block';
});

campaignTab.addEventListener('click',()=>{
    campaignContainer.style.display = 'block';
    graphicContainer.style.display = 'none';
});