import React, { useEffect, useState } from "react";
import body_animation from '../assets/body_animation.mp4';
import {CategoryScale,
   Chart,
    LinearScale, 
    LineController, 
    LineElement, 
    PointElement, 
    PieController, 
    ScatterController, 
    registry, 
    BarController, 
    BarElement, 
    DoughnutController, 
    ArcElement, 
  Title, Tooltip, Legend
} from 'chart.js';
import tree from '../dt_model_v1.json';
import manifest from '../preproc_v1.json';
import examples from '../golden_examples_v1.json';
import csv from '../alzheimers_disease_data.csv';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

function renderBinnedRiskSummary(arr) {
  const el = document.getElementById("binnedRiskSummary");
  if (!el) return;

  const bins = {};

  arr.forEach(r => {
    const age = parseFloat(r.Age);
    const diagnosis = parseInt(r.Diagnosis);
    if (isNaN(age) || isNaN(diagnosis)) return;

    const bin = Math.floor(age / 10) * 10;
    if (!bins[bin]) bins[bin] = { total: 0, positive: 0 };
    bins[bin].total++;
    if (diagnosis === 1) bins[bin].positive++;
  });

  const rows = Object.entries(bins).map(([bin, stats]) => {
    const rate = (stats.positive / stats.total * 100).toFixed(1);
    return `<tr><td>${bin}-${+bin + 10}</td><td>${stats.total}</td><td>${stats.positive}</td><td>${rate}%</td></tr>`;
  });

  el.innerHTML = `
    <table><thead><tr><th>Age Bin</th><th>Total</th><th>Positive</th><th>Rate</th></tr></thead>
    <tbody>${rows.join("")}</tbody></table>
  `;
}

function renderFeatureCorrelations(arr) {
  const el = document.getElementById("featureCorrelations");
  if (!el) return;

  const features = Object.keys(arr[0]).filter(k => k !== "Diagnosis");
  const diagnosis = arr.map(r => parseInt(r.Diagnosis)).filter(v => !isNaN(v));

const rows = features.map(f => {
  const values = arr.map(r => parseFloat(r[f])).filter(v => !isNaN(v));
  const corr = pearsonCorrelation(values, diagnosis);
  const color = corr > 0 ? "green" : "red";

  return `<tr>
    <td>${f}</td>
    <td style="color:${color}; font-weight:bold;">${corr.toFixed(3)}</td>
  </tr>`;
});


  el.innerHTML = `
    <table><thead><tr><th>Feature</th><th>Correlation with Diagnosis</th></tr></thead>
    <tbody>${rows.join("")}</tbody></table>
  `;
}

function renderClassImbalance(arr) {
  const el = document.getElementById("classImbalance");
  if (!el) return;

  const counts = arr.reduce((acc, r) => {
    const label = parseInt(r.Diagnosis);
    if (label === 0 || label === 1) acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const total = (counts[0] || 0) + (counts[1] || 0);
  const imbalanceHTML = `
    <strong>Negative:</strong> ${counts[0] || 0} (${((counts[0] || 0) / total * 100).toFixed(1)}%)<br>
    <strong>Positive:</strong> ${counts[1] || 0} (${((counts[1] || 0) / total * 100).toFixed(1)}%)
  `;
  el.innerHTML = imbalanceHTML;
}

function pearsonCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
  const sumXY = x.slice(0, n).reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((acc, val) => acc + val * val, 0);
  const sumY2 = y.slice(0, n).reduce((acc, val) => acc + val * val, 0);
  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
  return (denominator === 0) ? 0 : numerator / denominator;
}

function renderCorrelationValue(arr) {
  const el = document.getElementById("corVal");
  if (!el) return;

  const age = arr.map(r => parseFloat(r.Age)).filter(v => !isNaN(v));
  const diagnosis = arr.map(r => parseInt(r.Diagnosis)).filter(v => !isNaN(v));

  if (age.length !== diagnosis.length || age.length === 0) {
    el.textContent = "N/A";
    return;
  }

  const corr = pearsonCorrelation(age, diagnosis);
  el.textContent = corr.toFixed(3);
}


function preprocessInputs(rawInputs) {
  // Build a numeric feature array in the same order as manifest.final_feature_order
  // Handles numeric features and one-hot encoded categorical features.
  const processed = [];

  // helper mappings for string labels used in the form
  const labelsMap = {
    Gender: ["Male", "Female"],
    Ethnicity: ["White", "Black", "Hispanic", "Asian", "Other"],
    Smoking: ["No", "Yes"],
    FamilyHistoryAlzheimers: ["No", "Yes"],
    CardiovascularDisease: ["No", "Yes"],
    Diabetes: ["No", "Yes"],
    Depression: ["No", "Yes"],
    HeadInjury: ["No", "Yes"],
    Hypertension: ["No", "Yes"],
    MemoryComplaints: ["No", "Yes"],
    BehavioralProblems: ["No", "Yes"],
    Confusion: ["No", "Yes"],
    Disorientation: ["No", "Yes"],
    PersonalityChanges: ["No", "Yes"],
    DifficultyCompletingTasks: ["No", "Yes"],
    Forgetfulness: ["No", "Yes"]
  };

  manifest.final_feature_order.forEach((feature) => {
    const src = feature.source;

    if (feature.kind === "numeric") {
      // prefer provided numeric value, otherwise fall back to imputation
      const raw = rawInputs[src];
      const num = typeof raw === 'number' ? raw : (raw === undefined || raw === null || raw === '' ? undefined : parseFloat(raw));
      if (num === undefined || Number.isNaN(num)) {
        const impute = manifest.numeric_imputation?.[src];
        processed.push(impute ?? 0);
      } else {
        processed.push(num);
      }

    } else if (feature.kind === "onehot") {
      // For one-hot features we need to emit 1 when the raw input corresponds to this category
      const raw = rawInputs[src];
      let isOne = 0;

      if (raw === undefined || raw === null || raw === '') {
        isOne = 0; // missing categorical -> assume 0 for this category
      } else if (typeof raw === 'number') {
        isOne = (raw === feature.category) ? 1 : 0;
      } else {
        const rawStr = String(raw);
        const lower = rawStr.toLowerCase();

        // common yes/no handling
        if ((lower === 'yes' || lower === 'true' || lower === '1') && feature.category === 1) {
          isOne = 1;
        } else if ((lower === 'no' || lower === 'false' || lower === '0') && feature.category === 0) {
          isOne = 1;
        } else if (labelsMap[src]) {
          const idx = labelsMap[src].indexOf(rawStr);
          if (idx >= 0) {
            isOne = (idx === feature.category) ? 1 : 0;
          } else {
            // fallback: if raw string looks like a number, compare
            const maybeNum = parseInt(rawStr);
            if (!Number.isNaN(maybeNum)) {
              isOne = (maybeNum === feature.category) ? 1 : 0;
            } else {
              isOne = 0;
            }
          }
        } else {
          // try direct string-to-number match
          if (String(feature.category) === rawStr) {
            isOne = 1;
          } else {
            isOne = 0;
          }
        }
      }

      processed.push(isOne);
    }
  });

  return processed;
}

function calculateCorrelation(data, xKey, yKey) {
  const x = data.map(d => parseFloat(d[xKey]));
  const y = data.map(d => parseFloat(d[yKey]));
  const n = x.length;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);
  const sumY2 = y.reduce((acc, val) => acc + val * val, 0);

  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));

  return (denominator === 0) ? 0 : (numerator / denominator).toFixed(3);
}

function createHistogramData(data, key, binSize = 5) {
  const values = data.map(d => parseFloat(d[key])).filter(v => !isNaN(v));
  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));
  const bins = [];

  for (let i = min; i <= max; i += binSize) {
    bins.push({
      range: `${i}-${i + binSize}`,
      count: 0
    });
  }

    values.forEach(val => {
    const binIndex = Math.floor((val - min) / binSize);
    if (bins[binIndex]) bins[binIndex].count++;
  });

  return bins;
}

function sumFeatureByEducationLevel(data, featureKeys = []) {
  const values = data.map(d => {
    const edu = parseInt(d["EducationLevel"]);
    const entry = { edu };
    featureKeys.forEach(key => {
      entry[key] = parseFloat(d[key]);
    });
    return entry;
  }).filter(v =>
    !isNaN(v.edu) &&
    featureKeys.every(k => !isNaN(v[k]))
  );

  const bins = {};

  values.forEach(v => {
    const key = `Edu Level ${v.edu}`;
    if (!bins[key]) {
      bins[key] = {
        range: key,
        count: 0
      };
      featureKeys.forEach(k => bins[key][k] = 0);
    }

    bins[key].count++;
    featureKeys.forEach(k => bins[key][k] += v[k]);
  });

  return Object.values(bins);
}

function sumFeatureByAgeBin(data, binSize = 10, featureKeys = []) {
  const values = data.map(d => {
    const age = parseFloat(d["Age"]);
    const entry = { age };
    featureKeys.forEach(key => {
      entry[key] = parseFloat(d[key]);
    });
    return entry;
  }).filter(v =>
    !isNaN(v.age) &&
    featureKeys.every(k => !isNaN(v[k]))
  );

  const min = Math.floor(Math.min(...values.map(v => v.age)));
  const max = Math.ceil(Math.max(...values.map(v => v.age)));
  const bins = [];

  for (let i = min; i <= max; i += binSize) {
    const bin = {
      range: `${i}-${i + binSize}`,
      count: 0
    };
    featureKeys.forEach(k => bin[k] = 0);
    bins.push(bin);
  }

  values.forEach(v => {
    const binIndex = Math.floor((v.age - min) / binSize);
    if (bins[binIndex]) {
      bins[binIndex].count++;
      featureKeys.forEach(k => bins[binIndex][k] += v[k]);
    }
  });

  return bins;
}


function sumFeatureByBMIBin(data, binSize = 2, featureKeys = []) {
  const values = data.map(d => {
    const entry = { bmi: parseFloat(d["BMI"]) };
    featureKeys.forEach(key => {
      entry[key] = parseFloat(d[key]);
    });
    return entry;
  }).filter(v => !isNaN(v.bmi) && featureKeys.every(k => !isNaN(v[k])));

  if (values.length === 0) return [];

  const min = Math.floor(Math.min(...values.map(v => v.bmi)));
  const max = Math.ceil(Math.max(...values.map(v => v.bmi)));
  const bins = [];

  for (let i = min; i <= max; i += binSize) {
    const bin = {
      range: `${i}-${i + binSize}`,
      count: 0
    };
    featureKeys.forEach(k => bin[k] = 0);
    bins.push(bin);
  }

  values.forEach(v => {
    const binIndex = Math.floor((v.bmi - min) / binSize);
    if (bins[binIndex]) {
      bins[binIndex].count++;
      featureKeys.forEach(k => bins[binIndex][k] += v[k]);
    }
  });

  return bins;
}



// //numpy functionality in JS 
function csvToArr(stringVal, splitter) {
  const [rawKeys, ...rest] = stringVal.trim().split("\n").map((item) => item.split(splitter));
  const keys = rawKeys.map(k => k.trim()); // normalize keys

  const formedArr = rest.map((item) => {
    const object = {};
    keys.forEach((key, index) => {
      object[key] = item.at(index)?.trim(); // trim values too
    });
    return object;
  });

  return formedArr;
}

function buildChart(grouping, arr) {
  let aggregated;
  const features = ["AlcoholConsumption", "SleepQuality", "PhysicalActivity"];

  if (grouping === "education") {
    aggregated = sumFeatureByEducationLevel(arr, features);
  } else if (grouping === "bmi") {
    aggregated = sumFeatureByBMIBin(arr, 2, features);
  } else if (grouping === "age") {
    aggregated = sumFeatureByAgeBin(arr, 10, features); // you'd define this
  }

  const labels = aggregated.map(b => b.range);
  const datasets = [
  ...features.map((f, i) => ({
    label: `Total ${f}`,
    data: aggregated.map(b => b[f]),
    backgroundColor: ['rgba(255,99,132,0.7)', 'rgba(212,255,0,0.7)', 'rgba(177,16,240,0.69)'][i],
    hidden: i !== 0 // show only the first feature by default
  })),
  {
    label: 'Patient Count',
    data: aggregated.map(b => b.count),
    backgroundColor: 'rgba(54, 162, 235, 0.7)',
  }
];


  const chartCanvas = document.getElementById('chart1');
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext('2d');

  if (window.barChart) window.barChart.destroy();
  window.barChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Aggregated Health Metrics by ${grouping.charAt(0).toUpperCase() + grouping.slice(1)}`
        },
        legend: { position: 'top' }
      },
      scales: {
        x: { title: { display: true, text: grouping } },
        y: { title: { display: true, text: 'Aggregate Value' }, beginAtZero: true }
      }
    }
  });
}



console.log("CSV content:", csv);

function Addt() {

  const [selectedIndices, setSelectedIndices] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(false);
  const [grouping, setGrouping] = useState("bmi");

function setSelect() {
  // Clear previous selections
  setSelectedIndices([]);
  setComparisonResult(null);

  const headers = document.querySelectorAll("thead th");

  headers.forEach((th, i) => {
    const label = i === 0 ? "Custom Diagnosis" : `Patient ${i}`;
    th.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "6px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.index = i;

    const span = document.createElement("span");
    span.textContent = label;

    checkbox.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index);
      setSelectedIndices(prev =>
        e.target.checked
          ? [...prev, index]
          : prev.filter(j => j !== index)
      );
    });

    wrapper.appendChild(checkbox);
    wrapper.appendChild(span);
    th.appendChild(wrapper);
  });

  // Create compare button
  const compareBtn = document.createElement("button");
  compareBtn.textContent = "Compare Selected";
  compareBtn.id = "compareBtn";
  compareBtn.style.marginTop = "20px";
  compareBtn.style.padding = "8px 12px";
  compareBtn.style.fontSize = "14px";

compareBtn.onclick = () => {
  const selected = [];

  selectedIndices.forEach(i => {
    if (i === 0) {
      selected.push(userInputs);
    } else {
      const ex = examples[i - 1];
      if (ex?.input) selected.push(ex.input);
    }
  });

  if (selected.length < 2) {
    console.warn("Select at least two patients to compare.");
    return;
  }

  const featureKeys = Object.keys(selected[0]);
  const datasets = selected.map((patient, idx) => ({
    label: selectedIndices[idx] === 0 ? "Custom Diagnosis" : `Patient ${selectedIndices[idx]}`,
    data: featureKeys.map(f => {
      const val = patient[f];
      return typeof val === "string"
        ? isNaN(parseFloat(val)) ? null : parseFloat(val)
        : val;
    }),
    fill: false,
    borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
    tension: 0.3
  }));

  const chartCanvas = document.getElementById("comparisonChart");
  if (!chartCanvas) {
    console.warn("comparisonChart canvas not found");
    return;
  }

  setComparisonResult(true);

  if (window.lineChart) {
    window.lineChart.destroy();
  }

  window.lineChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: featureKeys,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Feature Comparison Across Selected Patients'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Features'
          },
          ticks: {
            autoSkip: false,
            maxRotation: 90,
            minRotation: 45
          }
        },
        y: {
          title: {
            display: true,
            text: 'Feature Value'
          },
          beginAtZero: true
        }
      }
    }
  });
};


  const table = document.querySelector("table");
  if (table && !document.getElementById("compareBtn")) {
    table.parentNode.insertBefore(compareBtn, table.nextSibling);
  }
}

  // const reader = new FileReader();
  const [prediction, setPrediction] = useState(null);
  registry.addControllers(LineController, ScatterController, PieController, BarController, DoughnutController);
registry.addElements(LineElement, PointElement, BarElement, ArcElement, Title, Tooltip, Legend);
registry.addScales(LinearScale, CategoryScale);


useEffect(() => {
  fetch(csv)
    .then(response => response.text())
    .then(text => {
      const arr = csvToArr(text, ',');
      const aggregated = sumFeatureByBMIBin(arr, 2, [
        "AlcoholConsumption",
        "SleepQuality",
        "PhysicalActivity"
      ]);
      const features = Object.keys(arr[0]);

       // === ANALYTICS ===
      renderClassImbalance(arr);
      renderFeatureCorrelations(arr);
      renderBinnedRiskSummary(arr);

const outcomeCounts = [0, 0]; // [Negative, Positive]

for (let i = 1; i < arr.length; i++) {
  const diagnosis = parseInt(arr[i].Diagnosis); // ensure numeric
  if (diagnosis === 0) {
    outcomeCounts[0] += 1;
  } else if (diagnosis === 1) {
    outcomeCounts[1] += 1;
  }
}

const datasizeDiv = document.getElementById("datasize");
const maxPatients = arr.length;
let hasAnimated = false;

const animateCount = () => {
  if (hasAnimated) return;
  hasAnimated = true;

  let count = 0;
  const duration = 1000;
  const stepTime = Math.max(Math.floor(duration / maxPatients), 10);

  const counter = setInterval(() => {
    count++;
    datasizeDiv.textContent = `${count} patients`;
    if (count >= maxPatients) clearInterval(counter);
  }, stepTime);
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) animateCount();
  });
}, { threshold: 0.5 });

observer.observe(datasizeDiv);


//visuals
 buildChart(grouping, arr); 
  
// === Chart 2: Class Imbalance Pie Chart ===
const chart2Canvas = document.getElementById('chart2');
if (!chart2Canvas) {
  console.warn("chart2 canvas not found");
} else {
  const ctx2 = chart2Canvas.getContext('2d');

  if (window.pieChart) {
    window.pieChart.destroy();
  }

  window.pieChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: ['Negative', 'Positive'],
      datasets: [{
        data: [outcomeCounts[0] || 0, outcomeCounts[1] || 0],
        backgroundColor: ['#00c778', '#ff6200'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Alzheimer\'s Diagnosis Class Distribution'
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.raw} patients`
          }
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

      // === METADATA ===
      document.getElementById('datasize').innerHTML = `${arr.length} patients`;
      document.getElementById('datafeatures').innerHTML = features.join(', ');

      const featureTypes = features.map(f => {
        const sample = arr.map(row => row[f]).slice(0, 10);
        const isNumeric = sample.every(val => !isNaN(parseFloat(val)));
        return `${f}: ${isNumeric ? 'Numeric' : 'Categorical'}`;
      });
      document.getElementById('featuretypes').innerHTML = featureTypes.join('<br>');

     
      document.getElementById('classbalance').innerHTML = `Negative: ${outcomeCounts[0] || 0}, Positive: ${outcomeCounts[1] || 0}`;

      const missingCounts = features.map(f => {
        const count = arr.filter(row => row[f] === '' || row[f] == null).length;
        return `${f}: ${count}`;
      });
      document.getElementById('missingvalues').innerHTML = missingCounts.join('<br>');

      const minValues = features.map(f => {
        const nums = arr.map(row => parseFloat(row[f])).filter(n => !isNaN(n));
        return nums.length ? `${f}: ${Math.min(...nums).toFixed(2)}` : null;
      }).filter(Boolean);
      document.getElementById('minvalues').innerHTML = minValues.join('<br>');

      const maxValues = features.map(f => {
        const nums = arr.map(row => parseFloat(row[f])).filter(n => !isNaN(n));
        return nums.length ? `${f}: ${Math.max(...nums).toFixed(2)}` : null;
      }).filter(Boolean);
      document.getElementById('maxvalues').innerHTML = maxValues.join('<br>');

      const meanValues = features.map(f => {
        const nums = arr.map(row => parseFloat(row[f])).filter(n => !isNaN(n));
        const mean = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : null;
        return mean ? `${f}: ${mean}` : null;
      }).filter(Boolean);
      document.getElementById('meanvalues').innerHTML = meanValues.join('<br>');

      const uniqueCounts = features.map(f => {
        const unique = new Set(arr.map(row => row[f]));
        return `${f}: ${unique.size}`;
      });
      document.getElementById('uniquecounts').innerHTML = uniqueCounts.join('<br>');

      const correlation = calculateCorrelation(arr, "BMI", "AlcoholConsumption");
      document.getElementById('corVal').innerHTML = `Correlation Value: ${correlation.toFixed(3)}`;

     

})
    .catch(error => {
      console.error("Failed to load CSV:", error);
    });
}, [grouping]);


useEffect(() => {
  const canvas = document.getElementById('correlationChart');
  if (!canvas) {
    console.warn("Canvas not yet in DOM");
    return;
  }

  const ctx = canvas.getContext('2d');

  // Optional: destroy previous chart if needed
  if (window.doughnut) {
    window.doughnut.destroy();
  }

  window.doughnut = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Negative", "Positive"],
      datasets: [
        {
          data: [prediction[0] * 100, prediction[1] * 100],
          backgroundColor: ["#00c778ff", "#ff6200ff"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.label}: ${context.raw.toFixed(1)}%`,
          },
        },
      },
    },
  });
}, [prediction]);

  function traverseTree(node, inputs) {
  if (node.is_leaf) {
    return node.value;
  }

  const featureValue = inputs[node.feature_index]; //ex. 0 for age = 65, [65, 0, 1,....]

  if (featureValue === undefined || featureValue === null) {
  console.warn(`Missing input for feature index ${node.feature_index}`);
  return [0.5, 0.5]; // or some fallback
}

  if (featureValue <= node.threshold) {
    return traverseTree(tree.tree.nodes[node.left], inputs);
  } else {
    return traverseTree(tree.tree.nodes[node.right], inputs);
  }
}

const [userInputs, setUserInputs] = useState({
  Age: 65,
  Gender: "Male",
  Ethnicity: "White",
  EducationLevel: 3,
  BMI: 24.5,
  Smoking: "No",
  AlcoholConsumption: 2,
  PhysicalActivity: 3,
  DietQuality: 6,
  SleepQuality: 7,
  FamilyHistoryAlzheimers: "Yes",
  CardiovascularDisease: "No",
  Diabetes: "No",
  Depression: "No",
  HeadInjury: "No",
  Hypertension: "No",
  SystolicBP: 120,
  DiastolicBP: 80,
  CholesterolTotal: 200,
  CholesterolLDL: 130,
  CholesterolHDL: 55,
  CholesterolTriglycerides: 150,
  MMSE: 28,
  FunctionalAssessment: 8,
  MemoryComplaints: "Yes",
  BehavioralProblems: "No",
  ADL: 9,
  Confusion: "No",
  Disorientation: "No",
  PersonalityChanges: "No",
  DifficultyCompletingTasks: "No",
  Forgetfulness: "Yes"
});

function handlePredict(e) {
  e.preventDefault();
  const processedInputs = preprocessInputs(userInputs);
  // preprocess the object inputs into the numeric feature array the tree expects
  const result = traverseTree(tree.tree.nodes[0], processedInputs);
  setPrediction(result);
}

const [activeButtonIndex, setActiveButtonIndex] = useState(null);

function handleChange(key) {
  return (e) => {
    let value = e.target.value;
    if (e.target.type === "number") {
      const parsed = parseFloat(value);
      value = isNaN(parsed) ? null : parsed;
    }
    setUserInputs((prev) => ({ ...prev, [key]: value }));
  };
}

function transfer_top(index) {
  const example = examples[index].input;
  setUserInputs({ ...example });
  setActiveButtonIndex(index); // track which button was clicked
 }


function handleReset() {
  setUserInputs({
  Age: 65,
  Gender: "Male",
  Ethnicity: "White",
  EducationLevel: 3,
  BMI: 24.5,
  Smoking: "No",
  AlcoholConsumption: 2,
  PhysicalActivity: 3,
  DietQuality: 6,
  SleepQuality: 7,
  FamilyHistoryAlzheimers: "Yes",
  CardiovascularDisease: "No",
  Diabetes: "No",
  Depression: "No",
  HeadInjury: "No",
  Hypertension: "No",
  SystolicBP: 120,
  DiastolicBP: 80,
  CholesterolTotal: 200,
  CholesterolLDL: 130,
  CholesterolHDL: 55,
  CholesterolTriglycerides: 150,
  MMSE: 28,
  FunctionalAssessment: 8,
  MemoryComplaints: "Yes",
  BehavioralProblems: "No",
  ADL: 9,
  Confusion: "No",
  Disorientation: "No",
  PersonalityChanges: "No",
  DifficultyCompletingTasks: "No",
  Forgetfulness: "Yes"
});
  setPrediction(null); // optional: clear prediction result
  setActiveButtonIndex(null); // track which button was clicked

}

let val_ranges = manifest.numeric_ranges_train;

  return (

    <>
  <div id="addt_back" style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "100%", alignItems: "center"}}>
    <h1 id="title"  style={{display: "flex", justifyContent: "center", fontSize: "40px", padding: 10, borderRadius: "14px"}}>Alzheimer's Diagnosis</h1>
  {prediction && (
  <div style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", width: "100%",}}>
        <video  style={{position: "absolute", height: "auto", width: "100%", zIndex: -1, opacity: "20%", marginTop: "100px", borderBottom: "solid black 8px"}} autoPlay muted loop src={body_animation}></video>

    <h2 style={{backgroundColor: "white", padding: 10, borderRadius: 5}}><b>Diagnosis: {prediction[0] > prediction[1] ? "Negative" : "Positive"}</b></h2>
    <p><b><span style={{backgroundColor: "white", borderRadius: "10px", padding: "5px"}}>Probabilities: <span style={{color: "green", backgroundColor: "white", borderRadius: "10px", padding: "5px"}}>Negative = {(prediction[0] * 100).toFixed(1)}%</span>, <span style={{color: "orange", backgroundColor: "white", borderRadius: "10px", padding: "5px"}}>Positive = {(prediction[1] * 100).toFixed(1)}%</span></span></b></p>
    <div style={{backgroundColor: "transparent", width: '400px', height: '300px', display: "flex", justifyContent: "center", alignItems: "center"}}>
        <canvas  id="correlationChart"></canvas>
</div>
    <small style={{backgroundColor: "white", marginTop: "10px", borderRadius: "10px", padding: "15px"}}>*This prediction is for educational purposes only and does not constitute medical advice.*</small>
  </div>
  )}

{/* Comparison Chart */}
{comparisonResult && (
<canvas id="comparisonChart" width="600" height="400"></canvas>
)}

<form id="predictForm" style={{marginTop: "30px"}} onSubmit={handlePredict}>
  <table>
   <thead>
    <th>
      <button
        onClick={() => 
          {
            handleReset()
            setActiveButtonIndex(null)
        }}
        className={activeButtonIndex === null ? "active" : ""}
      >
        Custom Diagnosis
      </button>
    </th>
    {[...Array(6)].map((_, i) => (
      <th key={i}>
        <button
          onClick={() => transfer_top(i)}
          className={activeButtonIndex === i ? "active" : ""}
        >
          Patient {i + 1} Diagnosis
        </button>
      </th>
    ))}
  </thead>
    <tbody>
      <td id="nav_buttons">
          <button type="submit">Predict</button>
          <button type="button" onClick={handleReset}>Reset</button>
          <button type="button" onClick={setSelect} >Compare</button>
      </td>
      <tr>
        <td><label>Age:</label></td>
        <td><input step={"any"} type="number" min={val_ranges.Age.min} max={val_ranges.Age.max} value={userInputs.Age} onChange={handleChange("Age")} /></td>
        <td><label>Gender:</label></td>
        <td>
          <select value={userInputs.Gender} onChange={handleChange("Gender")}>
            <option value={manifest.categorical_vocabulary.Gender[0]}>Male</option>
            <option value={manifest.categorical_vocabulary.Gender[1]}>Female</option>
          </select>
        </td>
        <td><label>Ethnicity:</label></td>
        <td>
          <select value={userInputs.Ethnicity} onChange={handleChange("Ethnicity")}>
            <option value={manifest.categorical_vocabulary.Ethnicity[0]}>White</option>
            <option value={manifest.categorical_vocabulary.Ethnicity[1]}>Black</option>
            <option value={manifest.categorical_vocabulary.Ethnicity[2]}>Hispanic</option>
            <option value={manifest.categorical_vocabulary.Ethnicity[3]}>Asian</option>
            <option value={4}>Other</option>
          </select>
        </td>
      </tr>

      <tr>
        <td><label>Education Level:</label></td>
        <td><input type="number" value={userInputs.EducationLevel} onChange={handleChange("EducationLevel")} min={manifest.categorical_vocabulary.EducationLevel[0]} max={manifest.categorical_vocabulary.EducationLevel[3]}/></td>
        <td><label>BMI:</label></td>
        <td><input step={"any"} type="number" value={userInputs.BMI} onChange={handleChange("BMI")} min={val_ranges.BMI.min} max={val_ranges.BMI.max} /></td>
        <td><label>Smoking:</label></td>
        <td>
          <select value={userInputs.Smoking} onChange={handleChange("Smoking")}>
            <option value={manifest.categorical_vocabulary.Smoking[0]}>No</option>
            <option value={manifest.categorical_vocabulary.Smoking[1]}>Yes</option>
          </select>
        </td>
      </tr>

      <tr>
        <td><label>Alcohol Consumption:</label></td>
        <td><input step={"any"} type="number" value={userInputs.AlcoholConsumption} onChange={handleChange("AlcoholConsumption")} min={val_ranges.AlcoholConsumption.min} max={val_ranges.AlcoholConsumption.max}/></td>
        <td><label>Physical Activity:</label></td>
        <td><input step={"any"} type="number" value={userInputs.PhysicalActivity} onChange={handleChange("PhysicalActivity")} min={val_ranges.PhysicalActivity.min} max={val_ranges.PhysicalActivity.max} /></td>
        <td><label>Diet Quality:</label></td>
        <td><input step={"any"} type="number" value={userInputs.DietQuality} onChange={handleChange("DietQuality")} min={val_ranges.DietQuality.min} max={val_ranges.DietQuality.max}/></td>
      </tr>

      <tr>
        <td><label>Sleep Quality:</label></td>
        <td><input step={"any"} type="number" value={userInputs.SleepQuality} onChange={handleChange("SleepQuality")} min={val_ranges.SleepQuality.min} max={val_ranges.SleepQuality.max}/></td>
        <td><label>Family History of Alzheimer's:</label></td>
        <td>
          <select value={userInputs.FamilyHistoryAlzheimers} onChange={handleChange("FamilyHistoryAlzheimers")}>
            <option value={manifest.categorical_vocabulary.FamilyHistoryAlzheimers[0]}>No</option>
            <option value={manifest.categorical_vocabulary.FamilyHistoryAlzheimers[1]}>Yes</option>
          </select>
        </td>
        <td><label>Cardiovascular Disease:</label></td>
        <td>
          <select value={userInputs.CardiovascularDisease} onChange={handleChange("CardiovascularDisease")}>
            <option value={manifest.categorical_vocabulary.CardiovascularDisease[0]}>No</option>
            <option value={manifest.categorical_vocabulary.CardiovascularDisease[1]}>Yes</option>
          </select>
        </td>
      </tr>

      <tr>
        <td><label>Diabetes:</label></td>
        <td>
          <select value={userInputs.Diabetes} onChange={handleChange("Diabetes")}>
            <option value={manifest.categorical_vocabulary.Diabetes[0]}>No</option>
            <option value={manifest.categorical_vocabulary.Diabetes[1]}>Yes</option>
          </select>
        </td>
        <td><label>Depression:</label></td>
        <td>
          <select value={userInputs.Depression} onChange={handleChange("Depression")}>
            <option value={manifest.categorical_vocabulary.Depression[0]}>No</option>
            <option value={manifest.categorical_vocabulary.Depression[1]}>Yes</option>
          </select>
        </td>
        <td><label>Head Injury:</label></td>
        <td>
          <select value={userInputs.HeadInjury} onChange={handleChange("HeadInjury")}>
            <option value={manifest.categorical_vocabulary.HeadInjury[0]}>No</option>
            <option value={manifest.categorical_vocabulary.HeadInjury[1]}>Yes</option>
          </select>
        </td>
      </tr>

      <tr>
        <td><label>Hypertension:</label></td>
        <td>
          <select value={userInputs.Hypertension} onChange={handleChange("Hypertension")}>
            <option value={manifest.categorical_vocabulary.Hypertension[0]}>No</option>
            <option value={manifest.categorical_vocabulary.Hypertension[1]}>Yes</option>
          </select>
        </td>
        <td><label>Systolic BP:</label></td>
        <td><input step={"any"} type="number" value={userInputs.SystolicBP} onChange={handleChange("SystolicBP") } min={val_ranges.SystolicBP.min} max={val_ranges.SystolicBP.max}  /></td>
        <td><label>Diastolic BP:</label></td>
        <td><input step={"any"} type="number" value={userInputs.DiastolicBP} onChange={handleChange("DiastolicBP")} min={val_ranges.DiastolicBP.min} max={val_ranges.DiastolicBP.max} /></td>
      </tr>

      <tr>
        <td><label>Total Cholesterol:</label></td>
        <td><input step={"any"} type="number" value={userInputs.CholesterolTotal} onChange={handleChange("CholesterolTotal")} min={val_ranges.CholesterolTotal.min} max={val_ranges.CholesterolTotal.max} /></td>
        <td><label>LDL Cholesterol:</label></td>
        <td><input step={"any"} type="number" value={userInputs.CholesterolLDL} onChange={handleChange("CholesterolLDL")} min={val_ranges.CholesterolLDL.min} max={val_ranges.CholesterolLDL.max} /></td>
        <td><label>HDL Cholesterol:</label></td>
        <td><input step={"any"} type="number" value={userInputs.CholesterolHDL} onChange={handleChange("CholesterolHDL")} min={val_ranges.CholesterolHDL.min} max={val_ranges.CholesterolHDL.max} /></td>
      </tr>

      <tr>
        <td><label>Triglycerides:</label></td>
        <td><input step={"any"} type="number" value={userInputs.CholesterolTriglycerides} onChange={handleChange("CholesterolTriglycerides")} min={val_ranges.CholesterolTriglycerides.min} max={val_ranges.CholesterolTriglycerides.max} /></td>
        <td><label>MMSE Score:</label></td>
        <td><input step={"any"} type="number" value={userInputs.MMSE} onChange={handleChange("MMSE")} min={val_ranges.MMSE.min} max={val_ranges.MMSE.max} /></td>
        <td><label>Functional Assessment:</label></td>
        <td><input step={"any"} type="number" value={userInputs.FunctionalAssessment} onChange={handleChange("FunctionalAssessment")} min={val_ranges.FunctionalAssessment.min} max={val_ranges.FunctionalAssessment.max} /></td>
      </tr>

      <tr>
        <td><label>Memory Complaints:</label></td>
        <td>
          <select value={userInputs.MemoryComplaints} onChange={handleChange("MemoryComplaints")}>
            <option value={manifest.categorical_vocabulary.MemoryComplaints[0]}>No</option>
            <option value={manifest.categorical_vocabulary.MemoryComplaints[1]}>Yes</option>
          </select>
        </td>
        <td><label>Behavioral Problems:</label></td>
        <td>
          <select value={userInputs.BehavioralProblems} onChange={handleChange("BehavioralProblems")}>
            <option value={manifest.categorical_vocabulary.BehavioralProblems[0]}>No</option>
            <option value={manifest.categorical_vocabulary.BehavioralProblems[1]}>Yes</option>
          </select>
        </td>
        <td><label>ADL:</label></td>
        <td><input step={"any"} type="number" value={userInputs.ADL} onChange={handleChange("ADL")} min={val_ranges.ADL.min} max={val_ranges.ADL.max} /></td>
      </tr>

      <tr>
        <td><label>Confusion:</label></td>
        <td>
          <select value={userInputs.Confusion} onChange={handleChange("Confusion")}>
            <option value={manifest.categorical_vocabulary.Confusion[0]}>No</option>
            <option value={manifest.categorical_vocabulary.Confusion[1]}>Yes</option>
          </select>
        </td>
        <td><label>Disorientation:</label></td>
        <td>
          <select value={userInputs.Disorientation} onChange={handleChange("Disorientation")}>
            <option value={manifest.categorical_vocabulary.Disorientation[0]}>No</option>
            <option value={manifest.categorical_vocabulary.Disorientation[1]}>Yes</option>
          </select>
        </td>
        <td><label>Personality Changes:</label></td>
        <td>
          <select value={userInputs.PersonalityChanges} onChange={handleChange("PersonalityChanges")}>
            <option value={manifest.categorical_vocabulary.PersonalityChanges[0]}>No</option>
            <option value={manifest.categorical_vocabulary.PersonalityChanges[1]}>Yes</option>
          </select>
        </td>
      </tr>

      <tr>
        <td><label>Difficulty Completing Tasks:</label></td>
        <td>
          <select value={userInputs.DifficultyCompletingTasks} onChange={handleChange("DifficultyCompletingTasks")}>
            <option value={manifest.categorical_vocabulary.DifficultyCompletingTasks[0]}>No</option>
            <option value={manifest.categorical_vocabulary.DifficultyCompletingTasks[1]}>Yes</option>
          </select>
        </td>
        <td><label>Forgetfulness:</label></td>
        <td>
          <select value={userInputs.Forgetfulness} onChange={handleChange("Forgetfulness")}>
            <option value={manifest.categorical_vocabulary.Forgetfulness[0]}>No</option>
            <option value={manifest.categorical_vocabulary.Forgetfulness[1]}>Yes</option>
          </select>
        </td>
        
      </tr>
    </tbody>
  </table>
</form>


{/* <button id="expander" onClick={() => setFormOpen(!formOpen) }>
  {formOpen ? "Hide Inputs" : "Set Inputs"}
</button> */}

{/* Dashboard: Load the CSV in the client to compute and present:

Metadata (dataset size, features, types, class balance, ranges, statistics), minimum 10 metrics.

Analytics (e.g., class imbalance metrics, correlations/associations, binned risk summaries)

Visualizations (e.g., histograms, bar charts, scatter plots, stacked bars) */}
<div id="metadataSection" style={{
  padding: "40px",
  backgroundColor: "#f9f9f9",
  borderRadius: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  maxWidth: "900px",
  margin: "40px auto",
  fontFamily: "Segoe UI, sans-serif"
}}>
  <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>Dataset Metadata</h1>

  <iframe
    src="https://www.kaggle.com/datasets/rabieelkharoua/alzheimers-disease-dataset/data"
    frameBorder="0"
    style={{
      width: "100%",
      height: "300px",
      borderRadius: "12px",
      marginBottom: "30px"
    }}
    title="Alzheimer's Dataset"
  />

  <a target="blank" href="https://www.kaggle.com/datasets/rabieelkharoua/alzheimers-disease-dataset/data">Additional Metadata</a>

  <h3>Data Size (Patients)</h3>
  <div id="datasize" style={{
    fontSize: "40px",
    fontWeight: "bold",
    color: "#0078D4",
    marginBottom: "20px"
  }}></div>

  <h3>Data Features</h3>
  <div id="datafeatures" style={{ marginBottom: "20px" }}></div>

  <h3>Feature Types</h3>
  <div id="featuretypes" style={{ marginBottom: "20px" }}></div>

  <h3>Class Balance</h3>
  <div id="classbalance" style={{ marginBottom: "20px" }}></div>

  <h3>Missing Values</h3>
  <div id="missingvalues" style={{ marginBottom: "20px" }}></div>

  <h3>Minimum Values</h3>
  <div id="minvalues" style={{ marginBottom: "20px" }}></div>

  <h3>Maximum Values</h3>
  <div id="maxvalues" style={{ marginBottom: "20px" }}></div>

  <h3>Mean Values</h3>
  <div id="meanvalues" style={{ marginBottom: "20px" }}></div>

  <h3>Unique Value Counts</h3>
  <div id="uniquecounts" style={{ marginBottom: "40px" }}></div>

  <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Alzheimer's Diagnosis Analytics</h1>

  <h3>Class Imbalance Metrics</h3>
  <div id="classImbalance" style={{ marginBottom: "20px" }}></div>

  <h3>Feature Correlations</h3>
  <div id="featureCorrelations" style={{ marginBottom: "20px" }}></div>

  <h3>Binned Risk Summaries (e.g., Age vs Diagnosis)</h3>
  <div id="binnedRiskSummary" style={{ marginBottom: "40px" }}></div>

  <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Visualizations</h1>
  <div id="slideshow" style={{
    backgroundColor: "#000",
    borderRadius: "30px",
    padding: "30px",
    width: "80%",
    color: "#fff",
  }}>
    {/* visuals */}
    <canvas id="chart1" width="600" height="400" style={{ marginBottom: "40px" }}></canvas>
    <p>X-AXIS Distribution</p>
    <select id="x" onChange={(e) => setGrouping(e.target.value)}>
      <option value="bmi">BMI</option>
      <option value="education">Education Level</option>
      <option value="age">Age</option>
    </select>

    <canvas id="chart2" width="600" height="400"></canvas>
  </div>
</div>

</div>
      </>
  );
}

export default Addt;


