import './App.css';
import {useState} from "react";
import PureModal from 'react-pure-modal';
import 'react-pure-modal/dist/react-pure-modal.min.css';
import parse from 'html-react-parser';

const substitutionCost = 2;

function App() {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [med, setMed] = useState("-");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");

  const [tableData, setTableData] = useState([]);
  const [medData, setMedData] = useState([]);

  function createTable(data) {
    let table = document.createElement('table');
    let tableBody = document.createElement('tbody');
    const tar = [...target];
    data.forEach(function (rowData, i) {
      let row = document.createElement('tr');
      let cell = document.createElement('td');
      if (i === 0) {
        cell.appendChild(document.createTextNode("#"));
      } else {
        cell.appendChild(document.createTextNode(tar[i - 1]));
      }
      row.appendChild(cell);
      rowData.forEach(function (cellData, j) {
        let cell = document.createElement('td');
        if (cellData !== 0) {
          cell.appendChild(document.createTextNode(cellData));
          cell.appendChild(document.createElement('br'));
          cell.appendChild(document.createElement('br'));
        }
        cell.appendChild(document.createTextNode(medData[i][j]));
        row.appendChild(cell);
      });
      tableBody.appendChild(row);
    });
    table.appendChild(tableBody);
    return table.innerHTML;
  }

  const levenshteinDistance = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    const medTable = [];
    for (let i = 0; i <= t.length; i++) {
      arr[i] = [i];
      medTable[i] = [i];
      for (let j = 1; j <= s.length; j++) {
        arr[i][j] =
          i === 0
            ? j
            : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : substitutionCost)
            );
        if (i === 0) {
          medTable[i][j] = "→";
        } else {
          medTable[i][0] = "↓";
          const sub = (arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : substitutionCost));
          const ins = arr[i - 1][j] + 1;
          const del = arr[i][j - 1] + 1;
          if (sub === del && del === ins) {
            medTable[i][j] = "→ ↓ ↘"
          } else if (del < sub && del < ins) {
            medTable[i][j] = "→"
          } else if (ins < sub && ins < del) {
            medTable[i][j] = "↓"
          } else if (sub < ins && sub < del) {
            medTable[i][j] = "↘"
          } else if (ins === del && ins < sub) {
            medTable[i][j] = "→ ↓"
          } else if (ins === sub && ins < del) {
            medTable[i][j] = "→ ↘"
          } else if (sub === del && sub < ins) {
            medTable[i][j] = "↘ ↓"
          }
        }
      }
    }
    setTableData(medTable)
    setMedData(arr);
    return arr[t.length][s.length];
  };

  const submitForm = event => {
    event.preventDefault()
    if (source.length <= 0 || target.length <= 0) {
      alert("Please Enter Source and Target!")
    } else {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setMed(levenshteinDistance(source, target))
        setModal(true)
      }, 2000)
    }
  }

  return (
    <div className="App">
      <div className="title">MED Calculator</div>
      <form onSubmit={submitForm}>
        <div className="input-group">
          <input
            className="form-control"
            autoComplete="off"
            type="text"
            name="source"
            id="source"
            placeholder="Source"
            onChange={e => setSource(e.target.value.toLowerCase())}
          />
          <label htmlFor="source">Source</label>
          <div className="req-mark">*</div>
        </div>
        <div className="input-group">
          <input
            className="form-control"
            autoComplete="off"
            type="text"
            name="target"
            id="target"
            placeholder="Target"
            onChange={e => setTarget(e.target.value.toLowerCase())}
          />
          <label htmlFor="target">Target</label>
          <div className="req-mark">*</div>
        </div>
        <button type="submit">
          {loading ? <div className="lds-dual-ring"></div> : "Calculate"}
        </button>
      </form>
      <PureModal
        className="med-modal"
        isOpen={modal}
        onClose={() => {
          setModal(false);
          return true;
        }}
      >
        <div className="modal-title">
          MED: {med}
          <br/>
          <span>Source: {source} - Target: {target}</span>
        </div>
        <div id="med-table">
          <table>
            <thead>
            <td>Source → <br/> Target ↓</td>
            <td>#</td>
            {
              [...source].map(c => <td>{c}</td>)
            }
            </thead>
            {
              parse(createTable(tableData))
            }
          </table>
        </div>
      </PureModal>
    </div>
  );
}

export default App;
