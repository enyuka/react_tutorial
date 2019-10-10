import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// 列の数
const column_number = 3;
// 行の数
const row_number = 3;

function Square(props) {
  return (
    <button className={"square " + (props.win_square ? 'win' : '')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let win_square = false;
    if (this.props.win_line) {
      win_square = this.props.win_line.includes(i);
    }
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        win_square={win_square}
      />
    );
  }
  
  render() {
    const divs = [];
    for (let i = 0; i < column_number; i++) {
      const squares = [];
      for (let j = 0; j < column_number; j++) {
        const square = this.renderSquare(j + (column_number * i));
        squares.push(square);
      }
      divs.push(<div key={i} className="board-row">{squares}</div>);
    }
    return (
      divs
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          locations: [],
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      // 昇順で履歴を並べるかどうか
      sortAsc: true,
    };
  }
  
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    let locations = current.locations.slice();
    locations = locations.concat([this.getLocation(i)]);
    this.setState({
      history: history.concat([
        {
          squares: squares,
          locations: locations
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }
  
  getLocation(i) {
    let row_number = 1;
    while (i >= (row_number * column_number)) {
      row_number++;
    }
    return [row_number - 1, i % column_number];
  }
  
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }
  
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    
    let moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + " " + step.locations[move - 1]:
        'Go to game start';
      return (
        <li className={this.state.stepNumber === move ? "current_move" : ""} key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    
    if (!this.state.sortAsc) {
      moves = moves.reverse();
    }
  
    let sort_toggle_button;
    if (this.state.sortAsc) {
      sort_toggle_button = <button onClick={() => this.setState({sortAsc: false,})}>desc</button>;
    } else {
      sort_toggle_button = <button onClick={() => this.setState({sortAsc: true,})}>asc</button>;
    }
    
    let status;
    if (winner) {
      status = "Winner: " + winner[0];
    } else {
      if (history.length - 1 !== column_number * row_number) {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      } else {
        status = "Draw";
      }
    }
    
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            win_line={winner ? winner[1] : null}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{sort_toggle_button}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  return null;
}
