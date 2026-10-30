import { Navigate } from "react-router-dom";

/**
 * CR role has been retired from PU UNICARE.
 * All CR dashboard routes seamlessly redirect to the Faculty Dashboard.
 */
const CRDashboard = () => {
  return <Navigate to="/dashboard/faculty" replace />;
};

export default CRDashboard;