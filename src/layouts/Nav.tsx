import { Box, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();

  return (
    <Box>
      <Link
        paddingLeft={1}
        paddingRight={1}
        onClick={() => navigate("/explore")}
      >
        Explore
      </Link>
      {" · "}
      <Link paddingLeft={1} onClick={() => navigate("/transact")}>
        Transact
      </Link>
    </Box>
  );
}
