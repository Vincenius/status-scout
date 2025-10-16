import { Link } from 'react-router-dom'
import styles from './InlineLink.module.css'

function InlineLink({ to, children, ...props }) {
  return (
    <Link to={to} {...props} className={styles.link}>{children}</Link>
  )
}

export default InlineLink
