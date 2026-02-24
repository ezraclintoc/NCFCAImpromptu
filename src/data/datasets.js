// Dataset registry for dynamic loading
export const datasetManifest = {
    ncfca_impromptu: {
        name: "NCFCA Impromptu",
        tagline: "Comprehensive topic list courtesy of Danielle Miller Speech & Debate (daniellemillerspeechdebate.com).",
        loader: () => import('./ncfca_impromptu.js').then(m => m.ncfca_impromptu)
    },
    ncfca_junior: {
        name: "NCFCA Junior",
        tagline: "Simplified and fun topics perfect for younger Impromptu speakers.",
        loader: () => import('./ncfca_junior.js').then(m => m.ncfca_junior)
    },
    ncfca_apologetics: {
        name: "NCFCA Apologetics",
        tagline: "Official NCFCA Apologetics 2025 Release: 48 Doctrinal and 48 Application Questions.",
        loader: () => import('./ncfca_apologetics.js').then(m => m.ncfca_apologetics)
    },
};

export const datasetKeys = Object.keys(datasetManifest);
export const defaultDataset = 'ncfca_impromptu';
