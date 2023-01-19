import { Box, Link } from "@chakra-ui/react";
import { Navigate, useNavigate } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();

  return (
    <Box>
      <Link paddingRight={3} onClick={() => navigate("/explore")}>
        Explore
      </Link>
      <Link paddingRight={3} onClick={() => navigate("/transact")}>
        Transact
      </Link>
    </Box>
  );
}
