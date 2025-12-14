// variantext.js
// Processes special ##variant tags in #main-content and provides functions to show/hide variants
let sortedVariants = [];

document.addEventListener('DOMContentLoaded', function () {
  processVariants();
});

function processVariants() {
  const main = document.getElementById('main-content');
  if (!main) return;
  let html = main.innerHTML;
  // Find all variants in the text (strip '=' if present)
  const variantSet = new Set();
  html.replace(/##([A-Za-z0-9\.]+)=?/g, function (match, variant) {
    variantSet.add(variant);
    return match;
  });
  // Dynamically create style for each variant
  const variantColors = [
    '#fffbe6', // a
    '#e6f7ff', // b
    '#f9e6ff', // c
    '#e6ffe6', // d
    '#ffe6f7', // e
    '#f7ffe6', // f
    '#e6e6ff', // g
    '#ffe6e6', // h
    '#e6fff7', // i
    '#f7e6ff' // j
  ];
  let styleContent = `
     #variant-btn-container button[aria-pressed="true"] {
      font-weight: bold;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
      transform: translateY(1px);
    }\n`;
  let idx = 0;
  // Store variant to color mapping
  const variantColorMap = {};
  variantSet.forEach(variant => {
    const color = variantColors[idx % variantColors.length];
    styleContent += `[data-variant="${variant}"],[data-variant="${variant}="] { background: ${color}; color: #333; }\n`;
    variantColorMap[variant] = color;
    idx++;
  });
  styleContent += `#main-content[data-exclusive="1"] * { display: none; }\n`;
  // Remove old dynamic style if present
  let oldStyle = document.getElementById('variantext-dynamic-style');
  if (oldStyle) oldStyle.remove();
  if (styleContent) {
    const styleEl = document.createElement('style');
    styleEl.id = 'variantext-dynamic-style';
    styleEl.textContent = styleContent;
    document.head.appendChild(styleEl);
  }
  const vmarker = '##'
  let currentVariant = ''
  let lastVariantNode = null;
  // Get sorted list of all variants for alphabetical comparison
  sortedVariants = Array.from(variantSet).sort();
  
  const children = Array.from(main.querySelectorAll('*'));
  for (const child of children) {
    if (currentVariant) {
      child.dataset.variant = currentVariant;
      const computedStyle = window.getComputedStyle(child);
      child.dataset.blockstyle = computedStyle.display;
    }
    if (true || child.tagName !== 'P') {
      let newHTML = child.innerHTML;
      // find position of vmarker in newHTML
      currentP = child;
      let markerPos = newHTML.indexOf(vmarker);
      while (markerPos !== -1) {
        let beforeMarker = newHTML.substring(0, markerPos);
        if ( beforeMarker.trim() === '' ) {
          let prevNode = currentP.previousSibling;
          currentP.remove();
          currentP = prevNode;
        } else {
          currentP.innerHTML = beforeMarker
        }
        // find position of next space after vmarker
        let spacePos = newHTML.indexOf(' ', markerPos + vmarker.length);
        if (spacePos === -1) {
          spacePos = newHTML.length;
        }
        // extract variant name (may include = for exclusive)
        currentVariant = newHTML.substring(markerPos + vmarker.length).replace(/([^A-Za-z0-9\.=]|\n)(.|\n)*/, '')
        newHTML = newHTML.substring(spacePos).trim();
        const newP = document.createElement('p');
        if (currentVariant) {
          newP.dataset.variant = currentVariant;
        }
        currentP.parentNode.insertBefore(newP, currentP.nextSibling);
        currentP = newP;
        if ( lastVariantNode ) {
          lastVariantNode.dataset.nextVariant = currentVariant
        }
        lastVariantNode = currentP;
        markerPos = newHTML.indexOf(vmarker);
      }
      if ( child.tagName ==='P' && newHTML.trim() === '' ) {
        currentP.remove();
      } else if ( newHTML !== currentP.innerHTML ) {
        currentP.innerHTML = newHTML;
      }
    }
  }
  // Create button container
  let btnContainer = document.getElementById('variant-btn-container');
  if (!btnContainer) {
    btnContainer = document.createElement('div');
    btnContainer.id = 'variant-btn-container';
    btnContainer.style.marginBottom = '1em';
    main.parentNode.insertBefore(btnContainer, main);
  } else {
    btnContainer.innerHTML = '';
  }
  // Add a button for each variant
  sortedVariants.forEach(variant => {
    const btn = document.createElement('button');
    btn.textContent = '' + variant;
    btn.onclick = function (ev) {
       showVariant(variant);
       ev.target.setAttribute('aria-pressed', 'true');
     };
    btn.style.background = variantColorMap[variant];
    btn.style.color = '#333';
    btn.style.borderWidth = 'thin';
    btn.style.marginRight = '0.5em';
    btnContainer.appendChild(btn);
  });
  // Add a button to show all
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All';
  allBtn.onclick = showVariant.bind(null, '');
  btnContainer.appendChild(allBtn);
}

selectedVariant = '';

function showVariant(variant = '') {
  const main = document.getElementById('main-content');
  if (!main) return;
  for ( const button of document.querySelectorAll('#variant-btn-container button') ) {
    button.setAttribute('aria-pressed', button.textContent === variant ? 'true' : 'false');
  }
  const onlyFit = (variant === selectedVariant);
  main.dataset.exclusive = +(onlyFit ? ! +main.dataset.exclusive : 0);
  selectedVariant = variant;
  const all = main.querySelectorAll('[data-variant]');
  all.forEach(el => {
    const elVariant = el.dataset.variant;
    const isExclusive = elVariant.endsWith('=');
    const elVariantClean = elVariant.replace('=', '');
    
    // Show if:
    // 1. Common content (empty variant)
    // 2. Showing all variants (variant === '')
    // 3. Element's variant matches selected variant (with or without '=')
    // 4. Element is non-exclusive and its variant comes alphabetically at or after selected variant
    
    if (variant === '' || elVariantClean === variant) {
      el.style.display = el.dataset.blockstyle ?? 'block';
    } else if (!isExclusive) {
      // Non-exclusive content: show if element's variant is alphabetically >= selected variant
      const elIndex = sortedVariants.indexOf(elVariantClean);
      const selectedIndex = sortedVariants.indexOf(variant);
      let nextVariantIndex = -1;
      if (el.dataset.nextVariant) {
        nextVariantIndex = sortedVariants.indexOf(el.dataset.nextVariant.replace('=', ''));
      }
      if (elIndex !== -1 && selectedIndex !== -1 && selectedIndex >= elIndex && (nextVariantIndex === -1 || selectedIndex < nextVariantIndex)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    } else {
      // Exclusive content for different variant
      el.style.display = 'none';
    }
  });
}
