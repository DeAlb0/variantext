// variantext.js
// Processes special ##variant tags in #main-content and provides functions to show/hide variants
let sortedVariants = [];

document.addEventListener('DOMContentLoaded', function () {
  logStart();
  processVariants();
});

function log(msg) {
  document.getElementById('variant-log').innerText += msg + '\n';
}

function logStart() {
  const main = document.getElementById('main-content');
  if (!main) return;
  let vlist = document.getElementById('variant-log');
  if (!vlist) {
    vlist = document.createElement('div');
    vlist.id = 'variant-log';
    vlist.style.marginBottom = '1em';
    main.parentNode.insertBefore(vlist, main);
  } else {
    vlist.innerHTML = '';
  }
}

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
  styleContent += `#main-content[data-exclusive="1"] [data-variant=""] { display: none; }\n`;
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
  sortedVariants = Array.from(variantSet).sort();  // sorted list of all variants for alphabetical comparison

  const variantState = {
    currentVariant: '',
    lastVariantNodeList: [],
    lastVariant: null,
    addNode(node, marker = undefined) {
      if (marker !== undefined) {
        this.currentVariant = marker;
        if (this.lastVariant !== this.currentVariant) {
          for (const lastVariantNode of this.lastVariantNodeList) {
            lastVariantNode.dataset.nextVariant = this.currentVariant;
          }
          this.lastVariantNodeList = [];
        }
      }
      this.lastVariant = this.currentVariant;
      if (!node) return;
      node.dataset.variant = this.currentVariant;
      if ( this.currentVariant !== '' ) {
        this.lastVariantNodeList.push(node);
      }
    }
  };

  // create pattern from vmarker
  const pattern = new RegExp(vmarker + '[A-Za-z0-9.]*=?\\s*', 'g');
  //   const pattern = /##[A-Za-z0-9.]*=?\s*/g;
  // TODO: get a more exhaustive list of block-level elements to process
  const children = Array.from(main.querySelectorAll(':scope > p, :scope > div, :scope > section, :scope > pre, :scope > ul, :scope h2'));
  for (const child of children) {
    //    if (!child.innerHTML.includes(vmarker)) continue;
    text = child.innerHTML
    const parts = text.split(pattern);  // Gets text between markers
    if (parts.length <= 1) {      // No markers found
      variantState.addNode(child);
      continue;
    }
    const markers = text.match(pattern).map(m => m.replace('##', '').replace('=', '').trim()); // Gets the markers
    if (parts.length === 2) {
      child.innerHTML = child.innerHTML.replace(pattern, ''); // Remove marker
      if (parts[0].trim() === '') {        // Marker at start only
        variantState.addNode(child, markers[0]);
        if (child.innerHTML.trim() === '') {
          child.remove();
        }
        continue;
      } else if (parts[1].trim() === '') {        // Marker at end only
        variantState.addNode(child);
        variantState.addNode(null, markers[0]);
        continue;
      }
    }
    // log('Split into ' + parts.length + ' parts. Markers: ' + (markers ? markers.length : 0));
    child.innerHTML = '';
    for (const [index, part] of parts.entries()) {
      // log(' Part ' + index + ': "' + markers[index] + ' - ' + part.trim().substring(0, 80) + '"');
      let newP = null;
      if (part !== '') {
        newP = document.createElement('span');
        newP.innerHTML = part;
        child.appendChild(newP);
      }
      variantState.addNode(newP, markers[index-1]);
    }
  }
  variantState.addNode(null, ''); // Finalize last node
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
  for (const button of document.querySelectorAll('#variant-btn-container button')) {
    button.setAttribute('aria-pressed', button.textContent === variant ? 'true' : 'false');
  }
  const onlyFit = (variant === selectedVariant);
  main.dataset.exclusive = +(onlyFit ? ! +main.dataset.exclusive : 0);
  selectedVariant = variant;
  let beforeList = []
  let behindList = []
  let varFound = false
  for (varname of sortedVariants) {
    if (varFound) {
      behindList.push(varname)
    }
    varFound |= (varname === selectedVariant)
    if (!varFound) {
      beforeList.push(varname);
    }
  }
  filterStyle = document.getElementById('variantext-filter-style');
  if (filterStyle === null) {
    filterStyle = document.createElement('style');
    filterStyle.id = 'variantext-filter-style';
    document.head.appendChild(filterStyle);
  }
  if (variant === '') {
    filterStyle.innerHTML = '';
    return;
  }
  const deselectedVariants = [
    // [data-variant] is added just to increase specifity of the CSS rule
    ...[...beforeList, variant].map(v => `[data-next-variant="${v}"][data-variant]`),
    ...behindList.map(v => `[data-variant="${v}"]`)
  ].join(',');

  filterStyle.innerHTML = `
    #main-content[data-exclusive="1"] [data-variant]:not([data-variant="${selectedVariant}"]) {
      display: none;
    }
    ${deselectedVariants} {
      display: none;
      color: #eee;
    }
    ${beforeList.map(v => `[data-variant="${v}"]`).join(',')} {
      /* color: red; */
    }
  `;
}
