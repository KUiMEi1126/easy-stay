import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Rate, Card, Select, InputNumber, Space, message, Divider , Upload, Modal, Popconfirm} from 'antd';
import { MinusCircleOutlined, PlusOutlined, SaveOutlined, RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import dayjs from 'dayjs'; // 必须引入，用于处理日期回显

const { TextArea } = Input;

// 模拟已有数据（如果是新建则为空）
// const mockExistingData = {
//     nameCn: "希尔顿大酒店",
//     nameEn: "Hilton Hotel",
//     address: "北京市朝阳区",
//     star: 5,
//     openedAt: "2010-05-01", // 字符串格式
//     tags: ["免费停车", "健身房"],
//     rooms: [
//       { name: "标准大床房", price: 500, count: 10 }
//     ],
//     images: 
//     [
//       "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3"
//     ]
// };

// 处理取消操作


const MerchantHotelEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
   // ============ 新增状态：图片上传列表 ============
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  // ===========================================
   // 1. 加载已有数据 (如果是修改模式)
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await request.get('/merchant/my-hotel');
        if (res) {
          // --- 数据格式转换 ---
          // 日期: String -> Dayjs
          if (res.openedAt) res.openedAt = dayjs(res.openedAt);
          
          // 图片: String[] -> FileList[]
          if (res.images && res.images.length > 0) {
            const formattedFiles = res.images.map((url, i) => ({
              uid: `-${i}`,
              name: `img-${i}.png`,
              status: 'done',
              url: url,
            }));
            setFileList(formattedFiles);
          }
          
          form.setFieldsValue(res);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, [form]);
// 2. 真实的图片上传 (替换之前的 mock)
  const customRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file); // 'file' 必须对应后端 multer 的字段名

    try {
      // 注意：这里使用 axios.post 而不是 request实例，
      // 因为 content-type 是 multipart/form-data，
      // 虽然 request 实例也能用，但为了避免拦截器干扰，直接用 axios 或者覆盖 header 也可以
      // 这里为了简单，直接复用 request 实例，axios 会自动识别 FormData
      const res = await request.post('/upload', formData);
      
      // 后端直接返回的是 URL 字符串，例如 "http://localhost:3000/..."
      onSuccess(res); 
    } catch (err) {
      onError(err);
      message.error('图片上传失败');
    }
  };

  // 处理 Upload 组件的变化
  const handleUploadChange = ({ fileList: newFileList }) => {
    // 如果上传成功，把后端返回的 url 挂载到 file 对象上
    newFileList = newFileList.map(file => {
      if (file.response) {
        file.url = file.response; // 将 mockUrl 赋值给 file.url
      }
      return file;
    });
    setFileList(newFileList);
  };

  // 处理预览
  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewOpen(true);
  };
  // ==========================================
  const handleCancel = () => {
    // 跳转回“我的酒店”查看页
    navigate('/admin/my-hotel');
  };

  // 3. 提交表单
  const onFinish = async (values) => {
    // 提取图片 URL
    // fileList 里可能有旧图片 (有 url 属性) 和新上传的图片 (response 属性)
    const images = fileList.map(f => f.url || f.response).filter(Boolean);

    const submitData = {
      ...values,
      openedAt: values.openedAt ? values.openedAt.format('YYYY-MM-DD') : null,
      images: images,
    };

    try {
      await request.post('/merchant/hotel-edit', submitData);
      message.success('提交成功');
      navigate('/admin/my-hotel');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="编辑酒店信息">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ rooms: [{}] }} // 默认给一个空的房型
        >
          {/* --- 基础信息模块 --- */}
          <Divider orientation="left">基本信息</Divider>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <Form.Item label="中文名称" name="nameCn" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="请输入酒店中文名" />
            </Form.Item>
            <Form.Item label="英文名称" name="nameEn" style={{ flex: 1 }}>
              <Input placeholder="请输入酒店英文名" />
            </Form.Item>
          </div>

          <Form.Item label="详细地址" name="address" rules={[{ required: true }]}>
             <TextArea rows={2} />
          </Form.Item>

          <div style={{ display: 'flex', gap: '20px' }}>
             <Form.Item label="星级" name="star" rules={[{ required: true }]}>
                <Rate />
             </Form.Item>
             <Form.Item label="开业时间" name="openedAt" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
             </Form.Item>
          </div>

          <Form.Item label="特色标签" name="tags" help="可以直接输入内容并回车，创建新标签">
            <Select mode="tags" style={{ width: '100%' }} placeholder="选择或输入标签" tokenSeparators={[',']}>
                <Select.Option value="免费Wifi">免费Wifi</Select.Option>
                <Select.Option value="免费停车">免费停车</Select.Option>
                <Select.Option value="含早餐">含早餐</Select.Option>
            </Select>
          </Form.Item>
           {/* ============ 新增：图片上传模块 ============ */}
          <Divider orientation="left">酒店相册</Divider>
          <Form.Item label="酒店外观/内饰图" tooltip="支持jpg/png格式">
            <Upload
                listType="picture-card"
                fileList={fileList}
                customRequest={customRequest} // 使用模拟上传
                onChange={handleUploadChange}
                onPreview={handlePreview}
            >
                {fileList.length >= 8 ? null : (
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                )}
            </Upload>
          </Form.Item>
          {/* ======================================== */}
          {/* --- 房型设置模块 (动态表单核心) --- */}
          <Divider orientation="left">房型设置</Divider>
          
          <Form.List name="rooms">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '请输入房型' }]}
                    >
                      <Input placeholder="房型名称 (如: 标准间)" style={{ width: 200 }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: '缺价格' }]}
                    >
                      <InputNumber placeholder="价格" prefix="￥" style={{ width: 120 }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'count']}
                      rules={[{ required: true, message: '缺数量' }]}
                    >
                      <InputNumber placeholder="房量" style={{ width: 100 }} />
                    </Form.Item>

                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                  </Space>
                ))}
                
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加房型
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              
              {/* 提交按钮 */}
              <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />}>
                提交保存
              </Button>

              {/* 新增：取消按钮 (带二次确认) */}
              <Popconfirm
                title="确定要取消编辑吗？"
                description="未保存的内容将会丢失，是否确认返回？"
                onConfirm={handleCancel}
                okText="确认离开"
                cancelText="继续编辑"
              >
                <Button size="large" icon={<RollbackOutlined />}>
                  取消返回
                </Button>
              </Popconfirm>
            </div>
          </Form.Item>
              
          {/* 图片预览弹窗 */}
          <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </Form>
      </Card>
    </div>
  );
};

export default MerchantHotelEdit;