// This static script runs before the body paints. It only hides the initial
// prompt for an existing valid choice; analytics still require React consent.
export const consentBootstrap = `(()=>{try{const choice=window.localStorage.getItem("elfeel-analytics-consent");if(choice==="accepted"||choice==="declined"){document.documentElement.setAttribute("data-elfeel-saved-consent","");}}catch{}})();`;
