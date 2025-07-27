export const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} TaskHakadoruGA</p>
        <p className="footer-sub">
          Created by Reo Kambara. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
