-- prevent a CLIENT role from linking to more than one client
create unique index one_client_per_client_role
  on "ClientUser"(userId)
  where (select role from "User" u where u.id = userId) = 'CLIENT';
