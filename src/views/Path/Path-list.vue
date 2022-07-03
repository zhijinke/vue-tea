<template>
  <div class="path-index container">
    <Header>
      <span v-if="isChange">添加地址</span>
      <span v-else>修改地址</span>
    </Header>
    <section class="container">
      <van-address-edit
        v-if="isChange"
        :area-list="areaList"
        show-set-default
        show-search-result
        :search-result="searchResult"
        @save="onSave"
        AddressInfo
      />
      <van-address-edit
        v-else
        :area-list="areaList"
        :address-info="AddressInfo"
        show-delete
        show-set-default
        show-search-result
        @save="onUpdate"
        @delete="onDelete"
      />
    </section>
    <Tabbar></Tabbar>
  </div>
</template>


<script>
import { Toast } from "vant";
import Header from "@/components/path/Header.vue";
import Tabbar from "@/components/common/Tabbar.vue";
import http from "@/common/api/request.js";
import { mapMutations } from "vuex";
export default {
  data() {
    return {
      isChange: true,
      areaList: {
        province_list: {
          110000: "北京市",
          120000: "天津市",
        },
        city_list: {
          110100: "北京市",
          120100: "天津市",
        },
        county_list: {
          110101: "东城区",
          110102: "西城区",
          120101: "塘沽区",
        },
      },
      searchResult: [],
    };
  },
  components: {
    Header,
    Tabbar,
  },
  created() {
    let key = this.$route.params.key;
    if (key == "add") {
      this.isChange = true;
    } else {
      this.isChange = false;
      this.AddressInfo = key;
      this.AddressInfo.isDefault =
        this.AddressInfo.isDefault == 1 ? true : false;
    }
  },
  methods: {
    ...mapMutations(["delAddress"]),
    onSave(content) {
      content.isDefault = content.isDefault ? 1 : 0;
      http
        .$axios({
          url: "/api/Addaddress",
          method: "post",
          headers: {
            token: true,
          },
          data: {
            content,
          },
        })
        .then((res) => {
          if (!res.success) return;
          this.$router.push("/path");
          Toast(res.msg);
        });
    },
    // 修改地址--》保存
    onUpdate(content) {
      content.isDefault = content.isDefault ? 1 : 0;
      http
        .$axios({
          url: "/api/updateAddress",
          method: "post",
          headers: {
            token: true,
          },
          data: {
            content,
          },
        })
        .then((res) => {
          if (!res.success) return;
          this.$router.push("/path");
          Toast(res.msg);
        });
    },
    // 删除地址
    onDelete(content) {
      console.log(content);
      http
        .$axios({
          url: "/api/delAddress",
          method: "post",
          headers: {
            token: true,
          },
          data: {
            id: content.id,
          },
        })
        .then((res) => {
          if (res.success) {
            this.delAddress(content.id);
              this.$router.push("/path");
              Toast(res.msg);
          }
        });
    },
  },
};
</script>


<style lang='scss' scoped>
section {
  background-color: #f7f7f7;
  .van-address-edit {
    padding: 0;
  }
  ::v-deep .van-address-edit__buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    flex-wrap: wrap;
    .van-button {
      width: 8rem;
      height: 1.066666rem;
    }
  }
  ::v-deep .van-button--danger {
    width: 8rem;
    height: 1.066666rem;
    background-color: #b0352f;
  }
}
::v-deep .tabbar {
  border-top: 2px solid #ccc;
}
</style>

