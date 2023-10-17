import Link from "@mui/material/Link";

import { managedProjects, specialUsers } from "../data/groups";

const LinkToUserWithPrefix = (
  name: string,
  prefix?: string,
  linkSuffix?: string
) => {
  var topath = "show";
  if (name in specialUsers) {
    if (prefix) {
      return prefix + "/" + specialUsers[name];
    } else {
      return specialUsers[name];
    }
  }
  if (linkSuffix) {
    topath = topath + "/" + linkSuffix;
  }
  if (prefix) {
    return (
      <Link href={`#/users/${name}/${topath}`}>{prefix + "/" + name}</Link>
    );
  } else {
    return <Link href={`#/users/${name}/${topath}`}>{name}</Link>;
  }
};

const LinkToGroupWithPrefix = (
  name: string,
  prefix?: string,
  linkSuffix?: string
) => {
  var topath = "show";
  if (linkSuffix) {
    topath = topath + "/" + linkSuffix;
  }

  if (!managedProjects.includes(name)) {
    if (prefix) {
      return prefix + "/" + name;
    } else {
      return name;
    }
  }
  if (prefix) {
    return (
      <Link href={`#/groups/${name}/${topath}`}>{prefix + "/" + name}</Link>
    );
  } else {
    return <Link href={`#/groups/${name}/${topath}`}>{name}</Link>;
  }
};

export { LinkToUserWithPrefix, LinkToGroupWithPrefix };
