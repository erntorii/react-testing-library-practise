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
