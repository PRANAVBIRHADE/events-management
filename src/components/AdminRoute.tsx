import React from 'react';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: Add real admin check with AuthContext
  return <>{children}</>;
};

export default AdminRoute;
