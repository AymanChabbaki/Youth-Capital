import penBanner from "../../assets/images/header-pen.svg";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-pen-wrap">
        <img src={penBanner} alt="" className="topbar-pen" />
      </div>
    </header>
  );
}
