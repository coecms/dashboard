export const StorageNote = () => (
  <div>
    <b>A note on storage</b>
    <br />
    Due to the different sources of the per-user data and the overall group
    data, the value in the 'Total Usage' field is unlikely to match the sum of
    usage over users. On Gadi, the overall group data comes from the file system
    'quota' command, whereas the per-user data comes from NCI's daily file
    scans. There will always be a discrepancy between the reported project usage
    and the sum of individual usage. There main reasons for this are:
    <ul>
      <li>
        On /scratch, expired files count towards the group quota, but are not
        included in the daily scan
      </li>
      <li>
        NCI maintains 5 /g/data file systems. On some of them, files under a
        project's directory count towards the quota (called 'project quotas'),
        but on others the group ownership counts (called 'group quotas'). <br />
        On file systems that enforce group quotas, group ownership only counts
        towards quotas if the files are in a directory on the same file system.
        <br />
        For example:
        <ul>
          <li>
            w40 and v45 are on the same file system which enforce group quotas,
            so files owned by the v45 group in the /g/data/w40 directory count
            towards v45's quota.
          </li>
          <li>
            v45 and hh5 are on different file systems, files owned by the v45 in
            the /g/data/hh5 directory count towards hh5's quota, as that file
            system enforces project quotas.
          </li>
        </ul>
      </li>
    </ul>
    NCI uses overall group data to determine whether a project is over quota or
    not, this is the data in the 'total' row on this page.
  </div>
);
