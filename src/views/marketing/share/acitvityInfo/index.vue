<script>
import List from './list'
import Edit from './edit'

export default {
  components: {
    List,
    Edit
  },
  render() {
    if (this.$route.name === 'List') {
      return <List />
    } else {
      return <Edit />
    }
  }
}
</script>
