import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Header />
        {children}
      </main>
    </div>
  );
}