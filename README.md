# React Testing Library practise

## create-react-app

```zsh
npx create-react-app . --template redux
```

## Step1. Rendering テスト

各 HTML 要素が存在するかどうかをテストする

### Import

```js
import React from "react";
import { render, screen } from "@testing-library/react";
import Render from "./Render";
```

### 実行方法

```zsh
yarn test
```

### 記述形式

```js
describe("テストの名前", () => {
  it("テストケースの内容", () => {
    render(<コンポーネント />); // render コマンドを使って、コンポーネントの内容を取得する
    // screen.debug(); // 取得したコンポーネント全体の要素を取得する
    // screen.debug(取得したい要素の指定);
    expect(screen.getByRole("heading")).toBeTruthy(); // ecpect() のカッコ内の要素が存在するかどうか(ToBeTruthy)の判定テスト
    expect(screen.queryByText("Udeeeeemy")).toBeNull();
    // null 要素に対してget~を使用すると、toBe~まで走らずエラー判定になってしまうため、この場合はquery~を使用する
  });
});
```

- 各 HTML タグは、Role というカテゴリーに分類されている。タグがどの Role に分類されているかはこちらを参照する。
  - https://github.com/A11yance/aria-query#elements-to-roles
- Jest に標準で定義されているマッチャについては以下を参照する。
  - https://jestjs.io/docs/en/expect
- Testing-Library 独自の拡張マッチャについては以下を参照する。
  - https://github.com/testing-library/jest-dom#custom-matchers

### 追加の設定

標準では、テスト結果を表示するコンソールにテスト名が含まれないため、含まれて表示されるように変更する。  
変更後は、`yarn test` を再起動する。

```json
  "scripts": {
    ...
-   "test": "react-scripts test",
+   "test": "react-scripts test --env=jsdom --verbose",
    ...
  },
```

## Step2. UserEvent テスト

ユーザーが起こすイベントを再現するテストを書く

### Import

```js
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RenderInput from "./RenderInput";
```

- `userEvent`: ユーザーのイベントをシミュレーションするもの。

### cleanup 関数の役割

1 つのファイル内で複数のテスト(`it`)を記述する場合、以下を記述する。

```zsh
afterEach(() => cleanup());
```

各テストでのレンダリングを毎回`cleanup`することで、テスト間で副作用が起きるなど  
テスト同士が干渉してしまうのを防ぐもの。

### Example

```js
describe("Input form onChange event", () => {
  it("Should update input value correctry", () => {
    render(<RenderInput />);
    const inputValue = screen.getByPlaceholderText("Enter");
    userEvent.type(inputValue, "test");
    // type: ユーザーのタイピングによるイベント, 第1引数: イベントを起こす要素, 第2引数: 入力する値
    expect(inputValue.value).toBe("test");
    // inputValue.value = 要素.属性, 'test'がvalue属性に入っているかを判定する
  });
});
```

### 条件分岐のテスト

```js
describe("Console button conditionally triggered", () => {
  it("Should not trigger output function", () => {
    const outputConsole = jest.fn(); // モック関数の定義
    render(<RenderInput outputConsole={outputConsole} />);
    userEvent.click(screen.getByRole("button"));
    // ユーザーのクリックによるイベント。引数にターゲット要素を取る。
    expect(outputConsole).not.toHaveBeenCalled();
    // 定義したモック関数が呼び出されないことを判定する
  });
});
```

```js
it("Should trigger output function", () => {
  const outputConsole = jest.fn();
  render(<RenderInput outputConsole={outputConsole} />);
  const inputValue = screen.getByPlaceholderText("Enter");
  userEvent.type(inputValue, "test"); // タイピングのイベントを用いて、入力した状態を作っておく
  userEvent.click(screen.getByRole("button"));
  expect(outputConsole).toHaveBeenCalledTimes(1);
  // 定義したモック関数が「1回」呼び出されることを判定する
});
```

## step3. List Component テスト

`map`メソッドによりリスト化されたコンポーネントをテストする。

### Example

```js
it("Should render list item correctly", () => {
  // App.js のデータセットを使用するのではなく、テスト用のダミーデータを作成する。
  const dummyData = [
    { id: 1, item: "React dummy" },
    { id: 2, item: "Angular dummy" },
    { id: 3, item: "Vue dummy" },
  ];
  // 作成したテスト用のダミーデータを props で渡す。
  render(<FrameworkList frameworks={dummyData} />);
  // 画面に表示される<li>要素からテキストデータを取り出し、配列化する。
  const frameworkItems = screen
    .getAllByRole("listitem")
    .map((ele) => ele.textContent);
  // 上記と対になる様に item の配列になるようにテストデータの方でも作成する。
  const dummyItems = dummyData.map((ele) => ele.item);
  // 上で作成した2つの配列が、同一となるか判定するテストを書く。
  expect(frameworkItems).toEqual(dummyItems);
});
```

## Step4. useEffect テスト

### Install

外部の API にアクセスする場合は、`axios` をインストールしておく。

```zsh
yarn add axios
```

### Example

#### component

```js
import React from "react";
import axios from "axios";

const UseEffectRender = () => {
  const [user, setUser] = React.useState(null);
  const fetchJSON = async () => {
    const res = await axios.get("https://jsonplaceholder.typicode.com/users/1");
    return res.data;
  };
  React.useEffect(() => {
    const fetchUser = async () => {
      const user = await fetchJSON();
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div>
      {user ? (
        <p>
          I am {user.username} : {user.email}
        </p>
      ) : null}
    </div>
  );
};
```

#### test

```js
describe("useEffect rendering", () => {
  // 非同期処理のテストを行う場合は、async を使う。
  it("Should render only after async function resolved", async () => {
    render(<UseEffectRender />);
    expect(screen.queryByText(/I am/)).ToBeNull();
    // 検索文字列をスラッシュで囲むことで正規化し、一部の文字列として対象にできる。
    expect(await screen.findByText(/I am/)).toBeInTheDocument();
    // await を使うのにあわせ、この場合はfindByTextを用いる。
  });
});
```

- `findBy~`: 非同期処理が終わるまで待った上で要素の探索をしてくれる(待ち時間: 4s)。

## API Mock (Mock Server Worker) コンポーネント

外部 API を使うのではなく、テスト用の API として、モックサーバをテスト上に作っていく。

### Install

```zsh
yarn add msw --save-dev
```

### Import

```js
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { rest } from "msw";
import { setupServer } from "msw/node";
```

### Setup

#### 擬似的な モックサーバ(API エンドポイント)の定義

```js
const server = setupServer(
  rest.get("https://jsonplaceholder.typicode.com/users/1", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ username: "Bred dummy" }));
  })
);
```

- 第 1 引数: API エンドポイントのパスを定義する
- 第 2 引数: アロー関数、引数に以下
  - `req`: リクエスト。第 1 引数で定義したパスに検索などのクエリを追記でき、パラメータへのアクセスなどができる。今回は使わない。
  - `res`: レスポンス。今回は、`ctx.status` でレスポンスコードを定義している(通信が成功した場合のレスポンスを作っている)。
  - `cts`: コンテキスト。`ctx.json` により、レスポンスで返す JSON オブジェクトの内容を定義する。

#### サーバの起動/終了 と cleanup

```js
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
```

- `beforeAll`: テストファイルの実行時、最初に 1 度だけ実行される。
- `server.listen()`: モックサーバの起動。
- `afterEach`: 各テストが終わる際に毎回実行される。
- `server.resetHandlers()`: 複数テストを記述する際は、これを実行する決まりになっている。
- `afterAll`: テストファイルの実行時、最後に 1 度だけ実行される。
- `server.close()`: モックサーバを閉じる。

### Example

#### API 取得に成功した場合

```js
describe("Mocking API", () => {
  it("[Fetch success]Should display fetched data correctry and button disable", async () => {
    render(<MockServer />);
    // ユーザによるボタンクリックイベントが発生したら...
    userEvent.click(screen.getByRole("button"));
    // ...画面にAPIデータが表示されるのを待って(findByText)から、画面に存在するかを判定。
    expect(await screen.findByText("Bred dummy")).toBeInTheDocument();
    // API読み込みが成功したらボタンが無効化になるため、disabled属性が<button>に存在するかを判定。
    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });
});
```

#### API 取得に失敗した場合

```js
it("[Fetch failure]Should display error msg, no render heading and button abled", async () => {
  server.use(
    rest.get(
      "https://jsonplaceholder.typicode.com/users/1",
      (req, res, ctx) => {
        return res(ctx.status(404));
      }
    )
  );
  render(<MockServer />);
  userEvent.click(screen.getByRole("button"));
  expect(await screen.findByTestId("error")).toHaveTextContent(
    "Fetching Failed !"
  );
  expect(screen.queryByRole("heading")).toBeNull();
  // disabled属性が<button>に存在しないかを判定。
  expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
});
```

- `server.use`: モックサーバの内容を書き換えることができる。

## Reducer テスト

### Import

```js
import reducer, {
  increment,
  incrementByAmount,
} from "../src/features/customCounter/customCounterSlice";
```

- `reducer` 本体と、テストする対象の reducer をインポートしておく

### Example

#### case1. increment

```js
describe("Reducer of ReduxToolKit", () => {
  describe("increment action", () => {
    // テスト用に state の初期値を設定しておく
    let initialState = {
      mode: 0,
      value: 1,
    };
    it("Should increment by 1 with mode 0", () => {
      // <action名>.type で action の type を取り出せる。
      const action = { type: increment.type };
      // 取り出した action type を action として渡す。
      const state = reducer(initialState, action);
      // state.value が想定通り +1 されているかの判定。
      expect(state.value).toEqual(2);
    });
  });
});
```

- Reducer の役割
  - 第 1 引数: state の初期値、第 2 引数: action を渡すことで、新しい state を返す。

#### case2. 別の mode でもテストする

```js
it("Should increment by 100 with mode 1", () => {
  // let で設定してある変数を利用し、mode を 1 に上書きする。
  initialState = {
    mode: 1,
    value: 1,
  };
  const action = { type: increment.type };
  const state = reducer(initialState, action);
  expect(state.value).toEqual(101);
});
```

#### case3. incrementByAmount

```js
  describe('incrementByAmount action', () => {
    // state の初期値を定義。
    let initialState = {
      mode: 0,
      value: 1,
    };
    it('Should increment by payload value with mode 0', () => {
      // action.payload を取る action に関しては、payload で任意の値を設定することができる。
      const action = { type: incrementByAmount.type, payload: 3 };
      const state = reducer(initialState, action);
      expect(state.value).toEqual(4);
    });
```

#### case4. 別の mode でもテストする

```js
it("Should increment by 100 * payload value with mode 1", () => {
  initialState = {
    mode: 1,
    value: 1,
  };
  const action = { type: incrementByAmount.type, payload: 3 };
  const state = reducer(initialState, action);
  expect(state.value).toEqual(301);
});
```

## extraReducer テスト

### Import

```js
import reducer, {
  fetchDummy,
} from "../src/features/customCounter/customCounterSlice";
```

- `reducer` 本体と、extraReducer テストの場合は、テストする対象の**非同期関数** をインポートする。

### Example

```js
describe("extraReducers", () => {
  // state の初期値を定義。
  const initialState = {
    mode: 0,
    value: 0,
  };
  it("Should output 100 + payload when fulfilled", () => {
    // action のtype は、<非同期関数>.<成功or失敗メソッド>.type で取り出すことができる。
    const action = { type: fetchDummy.fulfilled.type, payload: 5 };
    const state = reducer(initialState, action);
    expect(state.value).toEqual(105);
  });
});
```

## Integration テスト

Redux の各機能と、React コンポーネントを結びつけたテストを行う。  
Integration テストを行う場合、テスト用の store を新たに作っていく必要がある。

### 小技

```js
        <button onClick={() => dispatch(incrementByAmount(number | 0))}>
          IncrementByAmount
        </button>
        <input
          type="text"
          placeholder="Enter"
          value={number}
          onClick={(e) => setNumber(e.target.value)}
        />
```

- number 以外の文字列等がインプットで渡された場合は、強制的に 0 を返すようにする
  - `number | 0`: number が false の場合、null を返す

### Import

```js
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import Redux from "./Redux";
import { configureStore } from "@reduxjs/toolkit";
import customCounterReducer from "../src/features/customCounter/customCounterSlice";
```

### テスト用 store の作成

- 書き方は、`store.js` とほぼ同様。
- `beforeEach` を用いて、テストケースが毎回走る前に実行されるようにセットしておく。

```js
describe('Redux Integration Test', () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: {
        customCounter: customCounterReducer,
      },
    });
  });
  // ...
```

### テストの記述

- テストしたい対象のコンポーネントを`<Provider>`タグで囲み、props に 作成しておいたテスト用 `store` を渡したものをレンダーしておく。

```js
it("Should display value with increment by 1 per click", () => {
  render(
    <Provider store={store}>
      <Redux />
    </Provider>
  );
  userEvent.click(screen.getByText("+"));
  userEvent.click(screen.getByText("+"));
  userEvent.click(screen.getByText("+"));
  expect(screen.getByTestId("count-value")).toHaveTextContent(3);
});
// ...
```

## 非同期関数を用いた Integration テスト

### Import

```js
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import customCounterReducer from "../src/features/customCounter/customCounterSlice";
import ReduxAsync from "./ReduxAsync";
```

### テスト用 store の作成

```js
describe('ReduxAsync test', () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: {
        customCounter: customCounterReducer,
      },
    });
  });
  // ...
```

### store を含むレンダリングの作成

```js
  it('Should display value with 100 + payload', async () => {
    render (
      <Provider store={store}>
        <ReduxAsync />
      </Provider>
    );
    // ...
```

### テストコード記述

```js
    // ...
    userEvent.click(screen.getByText('FetchDummy'));
    expect(await screen.findByTestId('count-value')).toHaveTextContent('105');
  });
```

## 非同期関数及び API Mock を用いた Integration テスト

### Import

```js
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import customCounterReducer from "../src/features/customCounter/customCounterSlice";
import ReduxAsync from "./ReduxAsync";

import { rest } from "msw";
import { setupServer } from "msw/node";
```

### Mock Server の作成と、listen/reset/close の処理

```js
const server = setupServer(
  rest.get("https://jsonplaceholder.typicode.com/users/1", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ username: "Bred dummy" }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
```

### store の作成とテストの記述

```js
describe("Redux Async API Mocking", () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: {
        customCounter: customCounterReducer,
      },
    });
  });
  it("[Fetch success] Should display username in h3 tag", async () => {
    render(
      <Provider store={store}>
        <ReduxAsync />
      </Provider>
    );
    expect(screen.queryByRole("heading")).toBeNull();
    userEvent.click(screen.getByText("FetchJSON"));
    expect(await screen.findByText("Bred dummy")).toBeInTheDocument();
  });
});
```

### 失敗のテストを記述する場合

- Mock Server を上書きする形で、`404` を返す処理にする。

```js
  it('[Fetch failed] Should display anonymous in h3 tag', async () => {
    server.use(
      rest.get('https://jsonplaceholder.typicode.com/users/1', (req, res, ctx) => {
        return res(ctx.status(404));
      })
    );
    render (
    // ...
```

## Custom Hook 作成手順

### Import

```js
import { useState } from "react";
```

### 処理の記述

```js
export const useCounter = (initialCount) => {
  const [count, setCount] = useState(initialCount);

  const increment = () => {
    setCount((count) => count + 1);
  };
  const decrement = () => {
    setCount((count) => count - 1);
  };
  const double = () => {
    setCount((count) => count * 2);
  };
  const triple = () => {
    setCount((count) => count * 3);
  };
  const reset = () => {
    setCount(0);
  };

  return { count, increment, decrement, double, triple, reset };
};
```

## コンポーネントで Custom Hook を使用する

### Import

- 作成した Custom Hook をインポートする

```js
import { useCounter } from "./useCounter";
```

### 変数定義

- return で定義した返り値を使用できるように、変数定義しておく。

```js
const CustomHooks= () => {
  const { count, increment, decrement, double, triple, reset } = useCounter(3);
  // ...
```

### return(view)の記述

```js
  // ...
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={double}>Double</button>
      <button onClick={triple}>Triple</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
```

## Custom Hook テスト

### テストに必要なライブラリのインストール

```zsh
yarn add @testing-library/react-hooks
yarn add react-test-renderer
```

### Import

```js
import { useCounter } from "./useCounter";
import { act, renderHook } from "@testing-library/react-hooks";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

### テスト記述

- @testing-library の `renderHook` の中に、Custom Hook を格納し、  
  返り値として @testing-library の`result` で受け取る。
- Custom Hook で定義した変数や関数は、 `result.current.~~~` として使用することができる。
- Custom Hook で定義した関数を実行する場合は、@testing-libarary の `act` 関数の中に記述する。

```js
describe("useCounter custom Hook", () => {
  it("Should increment by 1", () => {
    const { result } = renderHook(() => useCounter(3));
    expect(result.current.count).toBe(3);
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(4);
  });
});
```
