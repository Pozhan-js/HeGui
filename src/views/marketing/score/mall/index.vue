<script>
import List from './list'
import Edit from './edit'

export default {
  components: {
    List,
    Edit
  },
  render() {
    if (this.$route.name === 'Mall') {
      return <List />
    } else {
      return <Edit />
    }
  }
}
</script>
