# Fix Redis "MISCONF" Error - Hết dung lượng ổ đĩa

## Vấn đề
Redis báo lỗi không thể ghi snapshot vào disk do:
- Ổ đĩa đầy
- Không có quyền ghi
- Không đủ dung lượng cho RDB snapshot

## Giải pháp đã áp dụng

### 1. Tắt Redis Persistence
Redis sẽ chỉ lưu data trong RAM, không ghi vào disk:
- `--save ""`: Tắt RDB snapshots
- `--appendonly no`: Tắt AOF (Append Only File)

### 2. Giới hạn Memory
- `--maxmemory 256mb`: Giới hạn Redis chỉ dùng tối đa 256MB RAM
- `--maxmemory-policy allkeys-lru`: Khi đầy, xóa key ít dùng nhất (LRU)

### 3. Xóa volume cũ
```bash
# Dừng containers
docker-compose down

# Xóa volume Redis cũ (nếu có)
docker volume rm cooking_redis_data

# Khởi động lại
docker-compose up -d
```

## Lưu ý

### Development (Khuyến nghị)
- Không cần persistence
- Data mất khi restart là OK
- Tiết kiệm disk space

### Production
Nếu cần lưu data Redis khi restart:

```yaml
redis:
  command: >
    redis-server
    --save 900 1
    --save 300 10
    --save 60 10000
    --maxmemory 512mb
    --maxmemory-policy allkeys-lru
  volumes:
    - redis_data:/data
```

Nhưng cần:
- Đủ dung lượng disk
- Monitoring disk usage
- Backup định kỳ

## Kiểm tra Redis

```bash
# Vào Redis container
docker exec -it cooking-redis redis-cli

# Kiểm tra config
CONFIG GET save
CONFIG GET appendonly
CONFIG GET maxmemory
CONFIG GET maxmemory-policy

# Kiểm tra memory usage
INFO memory

# Test set/get
SET test "hello"
GET test
```

## Các policy xóa key khi đầy memory

- `allkeys-lru`: Xóa key ít dùng nhất (khuyến nghị)
- `allkeys-lfu`: Xóa key ít truy cập nhất
- `volatile-lru`: Chỉ xóa key có TTL
- `volatile-ttl`: Xóa key có TTL ngắn nhất
- `noeviction`: Không xóa, trả lỗi khi đầy

## Monitoring

```bash
# Xem log Redis
docker logs cooking-redis

# Xem disk usage
docker exec cooking-redis df -h

# Xem Redis info
docker exec cooking-redis redis-cli INFO
```
