import '@testing-library/jest-dom';
import React from "react";
import { render, screen } from "@testing-library/react";
import Card from "../../../src/components/Card";

describe("Card 컴포넌트", () => {
  test("컴포넌트가 정상적으로 렌더링되는지 확인", () => {
    render(<Card title="Card Title" description="Card Description" />);
    
    // title과 description이 렌더링되는지 확인
    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Description")).toBeInTheDocument();
  });

  test("header가 주어지면 렌더링되는지 확인", () => {
    render(<Card title="Card Title" description="Card Description" header="Card Header" />);
    
    // header가 렌더링되는지 확인
    expect(screen.getByText("Card Header")).toBeInTheDocument();
  });

  test("smallText가 주어지면 렌더링되는지 확인", () => {
    render(<Card title="Card Title" description="Card Description" smallText="Small Text" />);
    
    // smallText가 렌더링되는지 확인
    expect(screen.getByText("Small Text")).toBeInTheDocument();
  });

  test("smallText가 주어지지 않으면 렌더링되지 않는지 확인", () => {
    render(<Card title="Card Title" description="Card Description" />);
    
    // smallText가 렌더링되지 않음을 확인
    const smallTextElement = screen.queryByText("Small Text");
    expect(smallTextElement).not.toBeInTheDocument();
  });
});
